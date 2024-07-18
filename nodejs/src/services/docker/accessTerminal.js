require('dotenv').config({ path: '../../.env' });
const { MongoClient } = require('mongodb');
const Docker = require('dockerode');

const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

const accessTerminal = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const cmd = req.params.cmd;  // Retrieve the command from the request parameters
        console.log(cmd);

        await client.connect();
        const db = client.db("controlia");
        const userCollection = db.collection('user');
        const userDocument = await userCollection.findOne({ userId: 'ravix' });

        if (!userDocument) {
            return res.status(404).json({ warn: "User not found" });
        }

        const containerId = userDocument.containerId;

        const execOptions = {
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Cmd: ['sh', '-c', `su - ${userDocument.userId} -c "${cmd}"`],  // Include the command
        };

        // Start a terminal session in the container
        const exec = await docker.getContainer(containerId).exec(execOptions);
        const stream = await exec.start({ hijack: true });

        // Collect output from the stream
        let output = '';
        stream.on('data', (chunk) => {
            output += chunk.toString();
        });

        stream.on('end', () => {
            res.status(200).json({ output });
        });

    } catch (error) {
        console.error(`Error accessing terminal: ${error}`);
        res.status(500).json({ error: "Failed to access terminal" });
    } finally {
        await client.close();
    }
};

module.exports = { accessTerminal };
