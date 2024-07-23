require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');

const logger = require('../../services/logs/winstonLogger');
const { getFileNamesFromContainer } = require('../../services/docker/manageVolumeFiles');

const getAllNotebooks = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { decodedToken } = req.body;

        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ userId: decodedToken.userId })

        const files = await getFileNamesFromContainer(user.containerId, `/${user.userId}/notebooks/`)
        const ipynbFiles = files
            .filter(filePath => {
                const relativePath = filePath.substring('notebooks/'.length);
                const slashCount = (relativePath.match(/\//g) || []).length;
                return slashCount === 0 && filePath.endsWith('.ipynb');
            })
            .map(filePath => filePath.substring('notebooks/'.length));  // Remove 'notebooks/' prefix

        return res.status(200).json({ info: 'Fetched notebooks successfully...', notebooks: ipynbFiles || [] });

    } catch (error) {
        logger.error(`ERROR IN GETING notebooks: ${error}`);
        return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
    } finally {
        if (client) {
            await client.close();
        }
    }
};



module.exports = { getAllNotebooks };
