const axios = require('axios');
const net = require('net');
require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');
const Docker = require('dockerode');
const { getFileFromContainer } = require('../../services/docker/manageVolumeFiles');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

const serverOnThisURL = async (url) => {
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            console.log('Server is running');
            return true
        } else {
            console.log('Server is not running');
            return false
        }
    } catch (error) {
        console.log('Server is not running');
        return false
    }
};

const serverOnThisPort = (port, host) => {
    const server = net.createServer();
    server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log('Port is in use, server is running');
            return true
        } else {
            console.log('Port is not in use');
            return false
        }
    });

    server.once('listening', () => {
        server.close();
        console.log('Port is not in use');
        return false
    });
    server.listen(port, host);
};


const checkServer = async(req, res) =>{
    try{
        

    }catch(err){

    }
}


const checkLogs = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let container;
    try {
        const { decodedToken, project, logType } = req.body;
        console.log(logType)
        
        await client.connect();
        const db = client.db('controlia');
        const usersCollection = db.collection('users');
        
        const user = await usersCollection.findOne({ userId: decodedToken.userId });

        const projectContainerId = user.projectContainerId;
        container = docker.getContainer(projectContainerId);

        const CONSOLELOGS_FILEPATH = `${user.userId}/${project.projectName}/console.log`;

        const logs = await getFileFromContainer(projectContainerId, CONSOLELOGS_FILEPATH);
        
        res.status(200).json({ info:'successfully fetched console logs', logs });

    } catch (err) {
        console.error(`Error checking logs: ${err}`);
        res.status(500).json({ warn: 'Failed to check logs' });
    } finally {
        await client.close();
    }
};

module.exports = {checkLogs}
