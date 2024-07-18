require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');
const { saveFileToContainer, getFileFromContainer, deleteFileFromContainer } = require('../../services/docker/manageVolumeFiles');
const path = require('path');
const filePath = path.join(__dirname, './test.cpp')


const saveFileToVolume = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { decodedToken } = req.body;
        const {fileInfo} = req.file;

        if(!(fileInfo)){
            return res.status(209).json({warn:'fileInfo missing from req.file '})
        }
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ userId: decodedToken.userId });

        if (!user) {
            return res.status(404).json({ warn: "User not found" });
        }

        const containerId = user.containerId;

        const response = await saveFileToContainer(containerId, fileInfo.dirPath, fileInfo.fileName, fileInfo.fileContent);

        res.status(200).json({ response });
    } catch (error) {
        logger.error(`ERROR DURING FILE SAVE: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
    } finally {
        await client.close();
    }
};

const getFileFromVolume = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { decodedToken, fileInfo } = req.body;
        if(!(fileInfo)){
            return res.status(209).json({warn:'fileInfo missing from body.'})
        }
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ userId: decodedToken.userId });

        if (!user) {
            return res.status(404).json({ warn: "User not found" });
        }

        const containerId = user.containerId;
        const file = await getFileFromContainer(containerId, fileInfo.filePath);

        res.status(200).json({info:'Successfully fetched file.', file });
    } catch (error) {
        logger.error(`ERROR GETTING FILE: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
    } finally {
        await client.close();
    }
};

const deleteFileFromVolume = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        const { decodedToken, fileInfo } = req.body;
        if(!(fileInfo)){
            return res.status(209).json({warn:'fileInfo missing from body.'})
        }
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ userId: decodedToken.userId });

        if (!user) {
            return res.status(404).json({ warn: "User not found" });
        }

        const containerId = user.containerId;

        const response = await deleteFileFromContainer(containerId, fileInfo.filePath);
        res.status(200).json({ response });
    } catch (error) {
        logger.error(`ERROR DURING FILE DELETE: ${error}`);
        res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
    } finally {
        await client.close();
    }
};

module.exports = { saveFileToVolume, getFileFromVolume, deleteFileFromVolume };
