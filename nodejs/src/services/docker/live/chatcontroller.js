require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const Docker = require('dockerode');

const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

const accessTerminal = async (socket, data) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const cmd = data.cmd;  // Retrieve the command from the WebSocket message
        console.log(`Executing command: ${cmd}`);

        await client.connect();
        const db = client.db("controlia");
        const userCollection = db.collection('user');
        const userDocument = await userCollection.findOne({ userId: 'ravix' });

        if (!userDocument) {
            socket.emit('error', { warn: "User not found" });
            return;
        }

        const containerId = userDocument.containerId;

        const execOptions = {
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Cmd: ['sh', '-c', `su - ${userDocument.userId} -c "${cmd}"`],  // Include the command
        };

        // Start a terminal session in the container
        const exec = await docker.getContainer(containerId).exec(execOptions);
        const stream = await exec.start({ hijack: true });

        // Handle the stream input and output
        socket.on('input', (input) => {
            stream.write(input);
        });

        stream.on('data', (chunk) => {
            socket.emit('output', chunk.toString());
        });

        stream.on('end', () => {
            socket.emit('end', 'Session ended');
        });

    } catch (error) {
        console.error(`Error accessing terminal: ${error}`);
        socket.emit('error', { error: "Failed to access terminal" });
    } finally {
        await client.close();
    }
};

module.exports = { accessTerminal };
