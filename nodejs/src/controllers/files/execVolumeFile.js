require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');
const { saveFileToContainer, getFileFromContainer, deleteFileFromContainer } = require('../../services/docker/manageFiles');
const path = require('path');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });


const execVolumeFile = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let output = [];

    try {
        const { decodedToken } = req.body;

        await client.connect();
        const db = client.db("controlia");
        const userCollection = db.collection('user');
        const userDocument = await userCollection.findOne({ userId: 'ravi' });

        if (!userDocument) {
            return res.status(404).json({ warn: "User not found" });
        }

        const containerId = userDocument.containerId;
        const container = docker.getContainer(containerId);
        const filePath = '/data/test.cpp'

        // Compile the C++ program
        let exec = await container.exec({
            Cmd: ['g++', filePath, '-o', '/data/test'],
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });

        let stream = await exec.start({ hijack: true });

        stream.on('data', (data) => {
            console.log(data.toString());
            output.push(data)
        });

        await new Promise((resolve) => {
            stream.on('end', resolve);
        });

        // / Run the compiled C++ program
        exec = await container.exec({
            Cmd: ['/data/test'],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });
        stream = await exec.start({ hijack: true, stdin: true });

        stream.on('data', (data) => {
            console.log(data.toString());
            output.push(data);
        });

        stream.on('end', () => {
            console.log('Stream ended');
        });

        return res.status(200).json({ output })

    } catch (error) {
        logger.error(`ERROR DURING FILE EXECUTION: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
    } finally {
        await client.close();
    }
};

module.exports ={execVolumeFile}