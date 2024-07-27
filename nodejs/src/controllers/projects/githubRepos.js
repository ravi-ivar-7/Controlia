require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { execCommandInContainer } = require('../../services/docker/manageContainer')
const { createProjectContainer } = require('./projectContainer');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

const githubRepo = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { accessToken, selectedRepo, decodedToken } = req.body;
        if (!accessToken || !selectedRepo) {
            return res.status(209).json({ warn: 'Missing repository name or required information.' });
        }
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ userId: decodedToken.userId })

        const projectsCollection = db.collection('projects')
        const alreadyDeployed = await projectsCollection.findOne({userId:decodedToken.userId, projectName: selectedRepo.name})
        if(alreadyDeployed){
            return res.status(209).json({warn: `${selectedRepo.name}  is already deployed. Delete or update from projects dashboard.`})
        }


        let projectContainer;
        let projectContainerId = user.projectContainerId;

        if (!projectContainerId) {
            projectContainer = await createProjectContainer(decodedToken);
            projectContainerId = projectContainer.id;
            console.log(`New project container created. ${projectContainer.id}`);
        }

        container = docker.getContainer(projectContainerId);

        const containerData = await container.inspect();
        const containerState = containerData.State.Status;

        if (containerState === 'exited' || containerState === 'created') {
            await container.remove();
            console.log(`Old project container ${projectContainerId} removed successfully.`);
            projectContainer = await createProjectContainer(decodedToken);
            projectContainerId = projectContainer.id;
            console.log(`Removed and created new project container. ${projectContainer.id}`);
        } else {
            console.log(`Project Container ${projectContainerId} is still running. Skipped removing it.`);
        }

        const zipUrl = `https://github.com/${selectedRepo.full_name}/archive/refs/heads/${selectedRepo.default_branch}.zip`;

        const PROJECTS_DIR = `${user.userId}`;
        const zipFilePath = `${PROJECTS_DIR}/${selectedRepo.name}.zip`;
        const targetDirName = `${PROJECTS_DIR}/${selectedRepo.name}`;

        await execCommandInContainer(projectContainerId, `mkdir -p ${PROJECTS_DIR}`);
        // Fetch the repository directly inside the container
        const fetchCommand = `curl -L -H "Authorization: token ${accessToken}" -H "Accept: application/vnd.github.v3.raw" ${zipUrl} -o ${zipFilePath}`;
        await execCommandInContainer(projectContainerId, fetchCommand);
        console.log(`${selectedRepo.name}.zip saved to container ${projectContainerId} at ${zipFilePath}`);
        // Remove target directory if it exists, unzip, move, and clean up
        const cleanupCommand = `
            rm -rf ${targetDirName} && \
            unzip -o ${zipFilePath} -d ${PROJECTS_DIR} && \
            mv ${PROJECTS_DIR}/${selectedRepo.name}-${selectedRepo.default_branch} ${targetDirName} && \
            rm ${zipFilePath}
        `;
        await execCommandInContainer(projectContainerId, cleanupCommand);


        return res.status(200).json({ info: 'Repositories downloaded, unzipped, and saved successfully.', projectName: selectedRepo.name });

    } catch (error) {
        console.error('Error during repo downloading:', error.message);
        return res.status(500).json({ warn: 'Error during repo downloading', error: error.message });
    }
};

module.exports = { githubRepo };