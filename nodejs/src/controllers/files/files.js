require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');
const { saveFileToContainer, getFileFromContainer, deleteFileFromContainer } = require('../../services/docker/manageFiles');
const path = require('path');
const filePath = path.join(__dirname, './test.cpp')


const saveFile = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { decodedToken } = req.body;

        await client.connect();
        const db = client.db("controlia");
        const userCollection = db.collection('user');
        const userDocument = await userCollection.findOne({ userId: 'ravi123'});

        if (!userDocument) {
            return res.status(404).json({ warn: "User not found" });
        }

        const containerId = userDocument.containerId;
        const response = await saveFileToContainer(containerId, filePath, '/data/test.cpp');
        res.status(200).json({ response });
    } catch (error) {
        logger.error(`ERROR DURING FILE SAVE: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
    } finally {
        await client.close();
    }
};

const getFile = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { decodedToken } = req.body;

        await client.connect();
        const db = client.db("controlia");
        const userCollection = db.collection('user');
        const userDocument = await userCollection.findOne({ userId: 'ravi' });

        if (!userDocument) {
            return res.status(404).json({ warn: "User not found" });
        }

        const containerId = userDocument.containerId;
        const file = await getFileFromContainer(containerId, '/data/test.cppp', './');
        res.status(200).json({ file });
    } catch (error) {
        logger.error(`ERROR DURING FILE GET: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
    } finally {
        await client.close();
    }
};

const deleteFile = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { decodedToken } = req.body;

        await client.connect();
        const db = client.db("controlia");
        const userCollection = db.collection('user');
        const userDocument = await userCollection.findOne({ userId:'ravi' });

        if (!userDocument) {
            return res.status(404).json({ warn: "User not found" });
        }

        const containerId = userDocument.containerId;
        const response = await deleteFileFromContainer(containerId, '/data/test.cpp');
        res.status(200).json({ response });
    } catch (error) {
        logger.error(`ERROR DURING FILE DELETE: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
    } finally {
        await client.close();
    }
};

module.exports = { saveFile, getFile, deleteFile };
