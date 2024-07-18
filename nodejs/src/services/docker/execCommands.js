const { MongoClient } = require('mongodb');
const Docker = require('dockerode');
const express = require('express');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

const executeCommand = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        await client.connect();
        const db = client.db("controlia");
        const userCollection = db.collection('user');
        const userDocument = await userCollection.findOne({ userId: req.params.newuserid });

        if (!userDocument) {
            return res.status(404).json({ warn: "User not found" });
        }

        const containerId = userDocument.containerId;
        const { command } = req.body; // Command to execute, e.g., "ls -l"

        if (!command) {
            return res.status(400).json({ warn: "Command is required" });
        }

        const execOptions = {
            AttachStdout: true,
            AttachStderr: true,
            Tty: false, // Not attaching TTY for command execution
            Cmd: command.split(' '), // Split command into array of arguments
        };

        // Execute command in the container
        const exec = await docker.getContainer(containerId).exec(execOptions);
        const execResult = await exec.start();

        // Stream output to client response
        execResult.on('data', (chunk) => {
            res.write(chunk);
        });

        execResult.on('end', () => {
            res.end();
        });

    } catch (error) {
        console.error(`Error executing command: ${error}`);
        res.status(500).json({ error: "Failed to execute command" });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

