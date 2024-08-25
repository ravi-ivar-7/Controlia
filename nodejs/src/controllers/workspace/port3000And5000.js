require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');
const Docker = require('dockerode');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock' || '//./pipe/docker_engine' });

async function generateBasicAuth(user, password) {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const authString = `${user}:${hashedPassword}`;
        return authString;
    } catch (error) {
        console.error('Error generating hash:', error);
        throw error;
    }
}


const port5000Credentials = async (req, res) => {
    const { username, password } = req.body;
    const containerId = req.params.containerId;

    try {
        const container = docker.getContainer(containerId);

        // Generate the Basic Auth string
        const authString = `${username}:${password}`; 
        const hashedPassword = Buffer.from(authString).toString('base64');

        // Update the container's labels with new credentials for port 5000
        await container.update({
            Labels: {
                [`traefik.http.middlewares.dev5000server_auth.basicauth.users`]: `${username}:${hashedPassword}`
            }
        });

         // Update the container's labels by removing the basic-auth middleware for port 5000
         await container.update({
            Labels: {
                [`traefik.http.routers.dev5000server.middlewares`]: '',  // Remove middleware for dev5000server
            }
        });
        
        res.status(200).json({ message: 'Credentials for Port 5000 updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};





const port3000Credentials = async (req, res) => {
    const { username, password } = req.body;
    const containerId = req.params.containerId;

    try {
        const container = docker.getContainer(containerId);

        // Generate the Basic Auth string
        const authString = `${username}:${password}`; 
        const hashedPassword = Buffer.from(authString).toString('base64');

        // Update the container's labels with new credentials for port 3000
        await container.update({
            Labels: {
                [`traefik.http.middlewares.dev3000server_auth.basicauth.users`]: `${username}:${hashedPassword}`
            }
        });

        await container.update({
            Labels: {
                [`traefik.http.routers.dev3000server.middlewares`]: '',  // Remove middleware for dev3000server
            }
        });

        res.status(200).json({ message: 'Credentials for Port 3000 updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {port3000Credentials, port5000Credentials}