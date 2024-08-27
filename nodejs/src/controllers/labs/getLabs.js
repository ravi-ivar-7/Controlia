require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');
const logger = require('../../services/logs/winstonLogger');

const getLabs = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let decodedToken;

    try {
        ({ decodedToken } = req.body);

        // Validate decodedToken
        if (!decodedToken || !decodedToken.userId) {
            return res.status(400).json({ error: 'Invalid or missing token.' });
        }

        await client.connect();
        const db = client.db("controlia");
        const containersCollection = db.collection('containers');
        const volumesCollection = db.collection('volumes');
        const resourcesCollection = db.collection('resources');
        
        // Fetch user resources
        const userResources = await resourcesCollection.findOne({ userId: decodedToken.userId });
        
        // Fetch containers and volumes for the user
        const containers = await containersCollection.find({ userId: decodedToken.userId, type: 'jupyterLab' }).toArray();
        const volumes = await volumesCollection.find({ userId: decodedToken.userId }).toArray();
        console.log(volumes)

        // Send success response
        return res.status(200).json({
            info: 'Fetched labs successfully.',
            labs: containers,
            volumes: volumes,
            userResources: userResources
        });

    } catch (error) {
        logger.error(`ERROR IN GETTING LABS: ${error.message}`);

        // Prepare and send error notification
        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: `An error occurred during fetching labs container for user ${decodedToken?.username || 'unknown'}.`,
            to: process.env.TO_ERROR_MAIL,
            text: `Function: getLabs\nDecodedToken: ${JSON.stringify(decodedToken)}\nError: ${error.message}`,
        };

        addToErrorMailQueue(mailOptions)
            .then(() => {
                logger.info('Error mail added.');
            })
            .catch((mailError) => {
                logger.error(`Failed to add error mail alert. ${mailError.message}`);
            });

        return res.status(500).json({ error: 'INTERNAL SERVER ERROR', details: error.message });
    } finally {
        await client.close();
    }
};

module.exports = { getLabs };
