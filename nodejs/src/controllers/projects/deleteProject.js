const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });
const { createProjectContainer } = require('./projectContainer');

const deleteProject = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        const { decodedToken, project } = req.body;
        await client.connect();

        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const projectsCollection = db.collection('projects');
        const projectsContainerCollection = db.collection('projectsContainer')

        const user = await usersCollection.findOne({ userId: decodedToken.userId });
        if (!user) {
            return res.status(209).json({ warn: 'User not found' });
        }

        const PROJECT_DIR = `${user.userId}/`;
        const container = docker.getContainer(user.projectContainerId);
        const pid = project.pid;
        // Execute command to kill the PID and delete the project directory
        const exec = await container.exec({
            Cmd: ['sh', '-c', `kill -9 ${pid} && cd ${PROJECT_DIR} && rm -rf ${project.projectName}`],
            AttachStdout: true,
            AttachStderr: true,
        });
        const response = await exec.start({ hijack: true });
        let output = '';

        response.on('data', (data) => {
            output += data.toString();
        });

        await new Promise((resolve, reject) => {
            response.on('end', resolve);
            response.on('error', reject);
        });

        // Delete the project record from the database
        await projectsCollection.findOneAndDelete({ userId: decodedToken.userId, projectName: project.projectName });

        // Update the specified port field in the projectContainerCollection
        const portToUpdate = `port${project.internalPort}`;
        const portUpdateFields = { status: 'free', projectName: '', projectId: '', host: '', internalPort: project.internalPort, externalPort: project.externalPort, pid: '' };

        const updateResult = await projectsContainerCollection.findOneAndUpdate(
            { userId: decodedToken.userId },
            { $set: { [portToUpdate]: portUpdateFields } },
            { returnOriginal: false }
        );

        if (updateResult.ok) {
            console.log('Project container updated successfully:', updateResult.value);
        } else {
            console.log('Failed to update project container.');
        }


        await projectsCollection.findOneAndDelete({ userId: decodedToken.userId, projectName: project.projectName });


        return res.status(200).json({ info: `${project.projectName} deleted successfully.` });

    } catch (error) {
        logger.error(`ERROR IN DELETING PROJECTS: ${error}`);
        return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { deleteProject };
