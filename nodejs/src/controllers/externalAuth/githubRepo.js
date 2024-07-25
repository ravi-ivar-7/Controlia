const axios = require('axios');
const path = require('path');
const fs = require('fs');
const stream = require('stream');
const util = require('util');
const pipeline = util.promisify(stream.pipeline);

const githubRepo = async (req, res) => {
    const { accessToken, selectedRepos } = req.body;

    if (!accessToken || !selectedRepos) {
        return res.status(209).json({ warn: 'Missing accessToken or selectedRepos' });
    }

    try {
        for (const repo of selectedRepos) {
            const zipUrl = `https://github.com/${repo.full_name}/archive/refs/heads/${repo.default_branch}.zip`;
            console.log(zipUrl)
            const response = await axios({
                url: zipUrl,
                method: 'GET',
                responseType: 'stream',
                headers: {
                    'Authorization': `token ${accessToken}`,
                    'Accept': 'application/vnd.github.v3.raw'
                }
            });
            const filePath = path.join(path.join(__dirname, 'downloaded'), `${repo.name}.zip`);
            await pipeline(response.data, fs.createWriteStream(filePath));

            console.log(`Repository downloaded: ${repo.full_name}`);
        }

        res.status(200).json({ info: 'Repositories downloaded successfully.' });
    } catch (error) {
        console.error('Error during repo downloading:', error.message);
        res.status(500).json({ warn: 'Error during repo downloading', error: error.message });
    }
};

module.exports = { githubRepo };
