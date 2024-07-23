require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

const killJupyterProcess = async (container, cmd) => {
    try {
        let exec = await container.exec({
            Cmd: cmd,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });

        const response = await exec.start({ hijack: true });
        const output = await new Promise((resolve, reject) => {
            let data = '';
            response.on('data', chunk => data += chunk.toString());
            response.on('end', () => resolve(data));
            response.on('error', reject);
        });

        if (output) {
            const pid = output.split(/\s+/)[1];
            exec = await container.exec({
                Cmd: ['kill', '-9', pid],
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
            });

            await exec.start({ hijack: true });
            return `Killed process with PID ${pid}`;
        }
    } catch (error) {
        logger.error(`Error killing Jupyter process: ${error}`);
        throw error;
    }
};


const jupyterServer = async (io, socket, data) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let container;
    try {
        const decodedToken = socket.decodedToken;
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ userId: decodedToken.userId });

        if (!user) {
            io.to(socket.decodedToken.userId).emit('warn', { message: 'User not found' });

        }

        const containerId = user.containerId;
        const notebookDirectory = `/${user.userId}/notebooks`;
        container = docker.getContainer(containerId);

        let processKillResponse = await killJupyterProcess(container, ['sh', '-c', 'ps aux | grep "jupyter"']);

        io.to(socket.decodedToken.userId).emit('data', { output: processKillResponse });

        let exec = await container.exec({
            Cmd: ['jupyter', 'notebook', '--no-browser', '--ip=0.0.0.0', '--port=8881', '--notebook-dir=' + notebookDirectory, '--allow-root'],
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });

        let response = await exec.start({ hijack: true, stdin: true });

        let token;
        let url;

        response.on('data', (data) => {
            const output = data.toString().replace(/[^\x20-\x7E]/g, '').trim();
            io.to(socket.decodedToken.userId).emit('data', { output });

            const tokenMatch = output.match(/token=([a-f0-9]{32})/);
            const urlRegex = /http:\/\/[^\s]+token=[a-f0-9]{32}/g;
            const urlMatch = output.match(urlRegex);

            if (tokenMatch) {
                token = tokenMatch[1];
                io.to(socket.decodedToken.userId).emit('connectionInfo', { token });
            }
            if (urlMatch) {
                url = urlMatch[0];
                io.to(socket.decodedToken.userId).emit('connectionInfo', { url });
            }
        });

        response.on('error', (err) => {
            const error = err.toString().replace(/[^\x20-\x7E]/g, '').trim();
            console.error(error);
            io.to(socket.decodedToken.userId).emit('error', { error });
        });

        await new Promise((resolve) => {
            response.on('end', resolve);
        });


        processKillResponse = await killJupyterProcess(container, ['sh', '-c', 'ps aux | grep "jupyter"']);
        io.to(socket.decodedToken.userId).emit('data', { output: processKillResponse });

    } catch (error) {
        logger.error(`ERROR STARTING JUPYTER SERVER: ${error}`);
        return io.to(socket.decodedToken.userId).emit('error', { message: 'An error occurred during server startup', details: error.toString() });
    } finally {
        await client.close();
        let processKillResponse = await killJupyterProcess(container, ['sh', '-c', 'ps aux | grep "jupyter"']);
        io.to(socket.decodedToken.userId).emit('data', { output: processKillResponse });
        io.to(socket.decodedToken.userId).emit('success', { message: 'Click "Start Notebook Server" again' });
    }
};

module.exports = { jupyterServer };
