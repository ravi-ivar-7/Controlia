require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

const deployProject = async (io, socket, data) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let container;
    try {
        console.log('starting');

        const decodedToken = socket.decodedToken;
        const { installCommand, startServerCommand, projectName } = data;
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ userId: decodedToken.userId });

        if (!user) {
            io.to(socket.decodedToken.userId).emit('error', { error: 'User not found' });
            return;
        }

        io.to(socket.decodedToken.userId).emit('data', { output: 'running' });

        const PROJECT_DIR = `${decodedToken.userId}/projects/flaskTestApp`;

        // Retrieve the container instance
        container = docker.getContainer(user.containerId);

        // Installing packages
        console.log('installing packages')
        let exec = await container.exec({
            Cmd: ['sh', '-c', `cd ${PROJECT_DIR} && ${installCommand}`],
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });

        let response = await exec.start({ hijack: true });

        response.on('data', (data) => {
            io.to(socket.decodedToken.userId).emit('data', { output: data.toString() });
        });

        response.on('error', (error) => {
            console.error('Exec error:', error.toString());
            io.to(socket.decodedToken.userId).emit('error', { error: error.toString() });
        });

        await new Promise((resolve) => {
            response.on('end', resolve);
        });
        console.log('starting server')

        // Starting server and logging output
        io.to(socket.decodedToken.userId).emit('data', { output: 'Starting server...' });
        console.log(`${PROJECT_DIR}.log`)
        exec = await container.exec({
            Cmd: ['sh', '-c', `cd ${PROJECT_DIR} && nohup ${startServerCommand} > /${'PROJECT_DIR'}.log 2>&1 &`],

            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });

        response = await exec.start({ hijack: true });

        response.on('data', (data) => {
            io.to(socket.decodedToken.userId).emit('data', { output: data.toString() });
        });

        response.on('error', (error) => {
            io.to(socket.decodedToken.userId).emit('error', { error: error.toString() });
        });

        await new Promise((resolve) => {
            response.on('end', resolve);
        });

        const logFilePath = `/${PROJECT_DIR}/logfile.log`;
        io.to(socket.decodedToken.userId).emit('data', { output: 'Server started successfully.' });
        io.to(socket.decodedToken.userId).emit('logFilePath', { output: logFilePath });

    } catch (error) {
        logger.error(`ERROR STARTING SERVER: ${error}`);
        return io.to(socket.decodedToken.userId).emit('error', { error: 'An error occurred during server startup', details: error.toString() });
    } finally {
        await client.close();
    }
};

module.exports = { deployProject };
