require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const stream = require('stream');
const util = require('util');
const pipeline = util.promisify(stream.pipeline);
const { saveFileStreamToContainer } = require('../../services/docker/manageVolumeFiles')
const { execInContainer } = require('../../services/docker/manageContainer')

const githubRepo = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { accessToken, selectedRepo, decodedToken } = req.body;
        if (!accessToken || !selectedRepo) {
            return res.status(209).json({ warn: 'Missing accessToken or repo' });
        }
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ userId: decodedToken.userId })

        const zipUrl = `https://github.com/${selectedRepo.full_name}/archive/refs/heads/${selectedRepo.default_branch}.zip`;

        const response = await axios({
            url: zipUrl,
            method: 'GET',
            responseType: 'stream',
            headers: {
                'Authorization': `token ${accessToken}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
        });

        const PROJECTS_DIR = `/${user.userId}/projects`;
        await saveFileStreamToContainer(user.containerId, PROJECTS_DIR, `${selectedRepo.name}.zip`, response.data);

        const unzipResult = await execInContainer(user.containerId, ['unzip', '-o', `${PROJECTS_DIR}/${selectedRepo.name}`, '-d', PROJECTS_DIR]);
        
        const extractedDirName = `${selectedRepo.name}-${selectedRepo.default_branch}`;
        const originalDirName = selectedRepo.name;

        const renameResult = await execInContainer(user.containerId, ['mv', `${PROJECTS_DIR}/${extractedDirName}`, `${PROJECTS_DIR}/${originalDirName}`]);
        const removeResult = await execInContainer(user.containerId, ['rm', `${PROJECTS_DIR}/${selectedRepo.name}.zip`]);

        return res.status(200).json({ info: 'Repositories downloaded, unzipped, and saved successfully.', projectName: `${originalDirName}` });

    } catch (error) {
        console.error('Error during repo downloading:', error.message);
        return res.status(500).json({ warn: 'Error during repo downloading', error: error.message });
    }
};

module.exports = { githubRepo };
