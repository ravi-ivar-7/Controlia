require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });
const logger = require('../../services/logs/winstonLogger');

const runCppFile = async (io, socket, data) => {
    const client = new MongoClient(process.env.MONGODB_URL);

    try {
        const decodedToken = socket.decodedToken;
        const script  = data.script;

        if (!script) {
            io.to(socket.decodedToken.userId).emit('warn', { message: 'script  info is missing in body.' });
            return;
        }
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const scriptsCollection = db.collection('scripts');

        const user = await usersCollection.findOne({ userId: decodedToken.userId });
        const scriptData = await scriptsCollection.findOne({ userId: decodedToken.userId, scriptName: script.scriptName });

        if (!user || !script) {
            io.to(socket.decodedToken.userId).emit('error', { message: 'User or script not found.' });
            return;
        }

        const SCRIPT_DIR = `/${user.userId}/scripts`;
        const objFile = script.scriptName.replace(/\.[^/.]+$/, '');
        const args = script.argumentList || [];

        const container = docker.getContainer(user.containerId);

        // Compile the C++ program
        let exec = await container.exec({
            Cmd: ['g++', `${SCRIPT_DIR}/${script.scriptName}`, '-o', `${SCRIPT_DIR}/${objFile}`],
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });

        let stream = await exec.start({ hijack: true, stdin:true });

        io.to(socket.decodedToken.userId).emit('data','compiling...');

        stream.on('data', (data) => {
            console.log(data.toString());
            io.to(socket.decodedToken.userId).emit('data', data.toString());
        });

        stream.on('error', (error) => {
            console.error(error.toString());
            io.to(socket.decodedToken.userId).emit('error', error.toString());
        });

        await new Promise((resolve) => {
            stream.on('end', resolve);
        });
        io.to(socket.decodedToken.userId).emit('data', 'compiled successfully.');

        // Run the compiled C++ program with arguments
        exec = await container.exec({
            Cmd: [`${SCRIPT_DIR}/${objFile}`, ...args],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });

        stream = await exec.start({ hijack: true, stdin: true });

        stream.on('data', (data) => {
            const output = data.toString().replace(/[^\x20-\x7E]/g, '').trim(); // Clean the output
            console.log(output);
            io.to(socket.decodedToken.userId).emit('data', output);
        });

        stream.on('error', (error) => {
            const errorMessage = error.toString().replace(/[^\x20-\x7E]/g, '').trim();
            console.error(errorMessage);
            io.to(socket.decodedToken.userId).emit('error', errorMessage);
        });

        await new Promise((resolve) => {
            stream.on('end', resolve);
        });

        io.to(socket.decodedToken.userId).emit('success', { message: 'C++ script executed successfully.' });
        return;

    } catch (error) {
        logger.error(`ERROR IN EXECUTING SCRIPT: ${error}`);
        io.to(socket.decodedToken.userId).emit('error', { message: 'An error occurred during script execution.', details: error.toString() });

    } finally {
        await client.close();
    }
};

module.exports = {
    runCppFile
};
