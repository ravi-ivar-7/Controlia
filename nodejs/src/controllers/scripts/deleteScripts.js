require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { deleteFileFromContainer } = require('../../services/docker/manageVolumeFiles')

const logger = require('../../services/logs/winstonLogger')

const deleteScripts = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { decodedToken, script } = req.body;
        if (!script) {
            return res.status(209).json({ warn: 'script is missing in body.' });
        }

        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const scriptsCollection = db.collection('scripts')
        console.log(script)
        const user = await usersCollection.findOne({ userId: decodedToken.userId })
        await scriptsCollection.findOneAndDelete({userId:decodedToken.userId, scriptName:script.scriptName})

        const USER_DIR = `/${user.userId}/scripts`
        console.log(script.scriptName, 'name')
        const deletedResult = await deleteFileFromContainer(user.containerId, `${USER_DIR}/${script.scriptName}`)
        console.log(deletedResult)
        res.status(200).json({info:`Deleted ${script.scriptName}`})
       

    } catch (error) {
        logger.error(`ERROR IN DELETING EXECUTION SCRIPT: ${error}`);
        return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
    }
};

module.exports = {
    deleteScripts
};
