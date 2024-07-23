require('dotenv').config({ path: '../../.env' });
const { MongoClient } = require('mongodb');
const Docker = require('dockerode');

const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

const containerTerminal = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { decodedToken, command } = req.body;

        if (!command || typeof command !== 'string') {
            return res.status(400).json({ error: "Invalid command" });
        }

        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const userDocument = await usersCollection.findOne({ userId: decodedToken.userId });

        if (!userDocument) {
            return res.status(404).json({ error: "User not found" });
        }

         // Sanitize command to remove leading `$` and extra spaces
        //  const sanitizedCommand = command.replace(/^\$?\s*/, '');

        console.log('cmd:', command)

        const containerId = userDocument.containerId;
        const execOptions = {
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Cmd: ['sh','-c', `${command}`],
        };

        const container = docker.getContainer(containerId);
        container.exec(execOptions, (err, exec) => {
            if (err) {
                console.error(`Error creating exec instance: ${err}`);
                return res.status(500).json({ error: "Failed to create exec instance" });
            }

            exec.start((err, stream) => {
                if (err) {
                    console.error(`Error starting exec: ${err}`);
                    return res.status(500).json({ error: "Failed to start exec" });
                }

                let output = '';
                stream.on('data', (chunk) => {
                    output += chunk.toString();
                    console.log(output)
                });

                stream.on('end', () => {
                    return res.status(200).json({ output });
                });

                stream.on('error', (err) => {
                    console.error(`Stream error: ${err}`);
                    return res.status(500).json({ error: "Stream error" });
                });
            });
        });
    } catch (error) {
        console.error(`Error accessing terminal: ${error}`);
        res.status(500).json({ error: "Failed to access terminal" });
    } finally {
        await client.close();
    }
};

module.exports = { containerTerminal };
