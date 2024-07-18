const { MongoClient } = require('mongodb');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

const containerModule = async (io, socket, data) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const decodedToken = socket.decodedToken;
        const moduleInstall = data.moduleInstall;
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ userId: decodedToken.userId });

        if (!user) {
            io.to(socket.decodedToken.userId).emit('error', { message: 'User not found.' });
            return;
        }

        const container = docker.getContainer(user.containerId);

        let cmd;
        if (moduleInstall.provider === 'apt-get') {
            cmd = [moduleInstall.provider, moduleInstall.type === 'install' ? 'install' : 'remove', '-y', moduleInstall.module];
        } else if (moduleInstall.provider === 'pip' || moduleInstall.provider === 'npm') {
            cmd = [moduleInstall.provider, moduleInstall.type, moduleInstall.module];
        } else {
            io.to(socket.decodedToken.userId).emit('error', { message: `Unknown provider - ${moduleInstall.provider} or module - ${moduleInstall.module}` });
            return;
        }

        const exec = await container.exec({
            Cmd: cmd,
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await exec.start({ hijack: true });

        stream.on('data', (data) => {
            const message = data.toString().trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
            io.to(socket.decodedToken.userId).emit('data', { message });
        });

        stream.on('error', (error) => {
            io.to(socket.decodedToken.userId).emit('error', { message: error.toString().trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '')});
        });

        await new Promise((resolve, reject) => {
            stream.on('end', resolve);
            stream.on('error', reject);
        });

        io.to(socket.decodedToken.userId).emit('success', { message: `${cmd.join(' ')} successful` });
    } catch (error) {
        io.to(socket.decodedToken.userId).emit('error', { message: `Error handling commands: ${error.message}` });
    } finally {
        await client.close();
    }
};

module.exports = { containerModule };
