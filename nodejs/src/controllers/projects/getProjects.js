require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');
const logger = require('../../services/logs/winstonLogger');

const getProjects = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let decodedToken;

    try {
        ({ decodedToken } = req.body);

        await client.connect();
        const db = client.db("controlia");
        const containersCollection = db.collection('containers');
        const volumesCollection = db.collection('volumes')

        const containers = await containersCollection.find({ userId: decodedToken.userId, type: 'projects' }).toArray();
        const volumes = await volumesCollection.find({userId: decodedToken.userId}).toArray();

        return res.status(200).json({ info: 'Fetched project workspace successfully.', containers, volumes });

    } catch (error) {
        logger.error(`ERROR IN GETTING WORKSPACE: ${error.message}`);

        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: `An error occurred during fetching projects container for user ${decodedToken?.username || 'unknown'}.`,
            to: process.env.TO_ERROR_MAIL,
            text: `Function : getProjects\nDecodedToken: ${JSON.stringify(decodedToken)}\nError: ${error.message}`,
        };

        addToErrorMailQueue(mailOptions)
            .then(() => {
                logger.info('Error mail added.');
            })
            .catch((mailError) => {
                logger.error(`Failed to add error mail alert. ${mailError.message}`);
            });

        return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    } finally {
        await client.close();
    }
};



module.exports = { getProjects };
