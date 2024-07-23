require('dotenv').config({ path: '../../.env' });
const { MongoClient } = require('mongodb');
const Docker = require('dockerode');

const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

const containerTerminal = async (io, socket, data) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const decodedToken = socket.decodedToken;
        const command = data.command;
        let sessionId = data.sessionId;

        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const userDocument = await usersCollection.findOne({ userId: decodedToken.userId });

        if (!userDocument) {
            io.to(socket.decodedToken.userId).emit('error', { error: 'User not found.' });
            return;
        }

        const containerId = userDocument.containerId;
        const container = docker.getContainer(containerId);

        if (command === 'startSession') {
            if (sessionId) {
                io.to(socket.decodedToken.userId).emit('error', { error: 'Session already started.' });
                return;
            }

            let exec = await container.exec({
                Cmd: ['sh'],
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
            });
            sessionId = exec.id;
            io.to(socket.decodedToken.userId).emit('sessionId', { sessionId });

            // let response = await exec.start();
            // response.on('data', (data) => {
            //     const output = data.toString()
            //     io.to(socket.decodedToken.userId).emit('data', { data: output });
            // });

        } else if (command === 'endSession') {
            if (!sessionId) {
                io.to(socket.decodedToken.userId).emit('error', { error: 'No session to end.' });
                return;
            }

            io.to(socket.decodedToken.userId).emit('data', { data: 'Session ended.' });
            console.log('Session ended');

            sessionId = null;
        } else {
            if (!sessionId) {
                io.to(socket.decodedToken.userId).emit('error', { error: 'Session not started.' });
                return;
            }

            const execOptions = {
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
                Cmd: ['sh', '-c', `${command}`],
            };

            const exec =  docker.getExec(sessionId);
            // console.log(exec)

            let stream = await exec.start(execOptions)

            console.log('started exec ')
            stream.on('data', (chunk) => {
                let output = chunk.toString();
                console.log(output)
                io.to(socket.decodedToken.userId).emit('data', { data: output });
            });

            stream.on('end', () => {
                io.to(socket.decodedToken.userId).emit('data', { data: 'ended...' });
            });

            stream.on('error', (err) => {
                const error = err.toString();
                console.error(`Stream error: ${error}`);
                io.to(socket.decodedToken.userId).emit('error', { error });
            });
            ;
        }
    } catch (error) {
        console.error(`Error accessing terminal: ${error}`);
        io.to(socket.decodedToken.userId).emit('error', { message: `Error handling commands: ${error.message}` });
    } finally {
        await client.close();
    }
};

module.exports = { containerTerminal };
