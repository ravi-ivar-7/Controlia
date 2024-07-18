require('dotenv').config({ path: '../../.env' });
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL);
const fs = require('fs');
const tar = require('tar-stream');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });


const installPackages = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { decodedToken } = req.body;

        await client.connect();
        const db = client.db("controlia");
        const userCollection = db.collection('user');
        const userDocument = await userCollection.findOne({ userId: '12' });

        if (!userDocument) {
            return res.status(404).json({ warn: "User not found" });
        }

        const container = userDocument.containerId;

        // Update package list
        let exec = await container.exec({
            Cmd: ['apt-get', 'update'],
            AttachStdout: true,
            AttachStderr: true,
        });
        let stream = await exec.start();
        stream.pipe(process.stdout);

        // Install g++
        exec = await container.exec({
            Cmd: ['apt-get', 'install', '-y', 'g++'],
            AttachStdout: true,
            AttachStderr: true,
        });
        stream = await exec.start();
        stream.pipe(process.stdout);

        console.log(`g++ installed successfully in container ${container}`);

        res.status(200).json({info:"successfully installed packages"})
    } catch (error) {
        console.error(`Error installing g++: ${error}`);
    }
}


module.exports = { installPackages }