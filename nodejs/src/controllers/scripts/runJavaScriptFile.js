require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });
const logger = require('../../services/logs/winstonLogger');


const runJavaScriptFile = async (io, socket, data) => {
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

        if (!user || !scriptData) {
            io.to(socket.decodedToken.userId).emit('error', { message: 'User or script not found.' });
            return;
        }

        const SCRIPT_DIR = `/${user.userId}/scripts`;

        const container = docker.getContainer(user.containerId);

        const args = script.argumentList || [];

        // Run the JavaScript script with Node.js
        let exec = await container.exec({
            Cmd: ['node', `${SCRIPT_DIR}/${script.scriptName}`,...args],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });

        let stream = await exec.start({ hijack: true, stdin: true });

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

        io.to(socket.decodedToken.userId).emit('success', { message: 'JavaScript script executed successfully.' });

    } catch (error) {
        logger.error(`ERROR IN EXECUTING JAVASCRIPT SCRIPT: ${error}`);
        io.to(socket.decodedToken.userId).emit('error', { message: 'An error occurred during script execution.', details: error.toString() });
    } finally {
        await client.close();
    }
};

module.exports = {
    runJavaScriptFile
};

