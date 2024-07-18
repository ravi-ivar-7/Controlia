const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });
require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL);

async function manageContainer(req, res) {
    try {

        const { decodedToken } = req.body;
        // if (!(decodedToken)) {
        //     return res.status(209).json({ warn: "Token missing" });
        // }
        await client.connect();
        const db = client.db("controlia");
        const userCollection = db.collection('user');

        // const userDocument = await userCollection.findOne({ $or: [{ email: userId }, { userId: userId }] });
        const userDocument = await userCollection.findOne({ userId:'ravix' });
        if (!userDocument) {
            return res.status(209).json({ warn: "User not found" });
        }
        console.log(userDocument)
        const container = docker.getContainer(userDocument.containerId);

        // Inspect the container for detailed info
        const data = await container.inspect();

        // Get container stats
        const stats = await container.stats({ stream: false });

        // Extract relevant info
        const containerInfo = {
            id: data.Id,
            name: data.Name,
            state: data.State,
            config: data.Config,
            hostConfig: data.HostConfig,
            networkSettings: data.NetworkSettings,
            stats: {
                memoryUsage: stats.memory_stats.usage,
                memoryLimit: stats.memory_stats.limit,
                cpuUsage: stats.cpu_stats.cpu_usage.total_usage,
                cpuSystemUsage: stats.cpu_stats.system_cpu_usage,
            },
        };

        console.log(containerInfo);
        return res.status(200).json({info:'successfully fetched container info.', containerInfo})
    } catch (error) {
        console.error('Error getting container info:', error);
        throw error;
    }
}

module.exports = { manageContainer }
