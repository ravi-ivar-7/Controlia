require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { getFileFromContainer } = require('../../services/docker/manageFiles')

const logger = require('../../services/logs/winstonLogger');

const getScriptContent = async (req, res) => { // individual file
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { decodedToken , script} = req.body;
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ userId: decodedToken.userId })
        const scriptsCollection = db.collection('scripts');
       
        const scriptData = await scriptsCollection.findOne({ userId: decodedToken.userId, scriptName:script.scriptName })


        const USER_DIR = `/${user.userId}/scripts`
       
        const fileContent = await getFileFromContainer(user.containerId, `${USER_DIR}/${script.scriptName}`);
        return res.status(200).json({ info: 'Fetched file successfully...', script:{...scriptData, scriptContent: fileContent} });

    } catch (error) {
        logger.error(`ERROR IN GETING SCRIPT: ${error}`);
        return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
    } finally {
        if (client) {
            await client.close();
        }
    }
};

const getAllScripts = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { decodedToken } = req.body;

        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const user = usersCollection.findOne({ userId: decodedToken.userId })
        const scriptsCollection = db.collection('scripts');
       
        const scripts = await scriptsCollection.find({ userId: decodedToken.userId }).toArray() || []

        return res.status(200).json({ info: 'Fetched scripts successfully...', scripts });

    } catch (error) {
        logger.error(`ERROR IN GETING SCRIPT: ${error}`);
        return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
    } finally {
        if (client) {
            await client.close();
        }
    }
};



module.exports = { getScriptContent, getAllScripts };
