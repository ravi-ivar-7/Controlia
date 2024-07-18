const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });
require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const getWorkspaceInfo = async (req, res) => {
    let client;
    try {
        const { decodedToken } = req.body;
        client = new MongoClient(process.env.MONGODB_URL);
        await client.connect();
        const db =  client.db("controlia");
        const usersCollection =   db.collection('users');
        const user = await usersCollection.findOne({ userId: decodedToken.userId })

        const getcontainer =  docker.getContainer(user.containerId);

        const data = await getcontainer.inspect();

        const stats = await getcontainer.stats({ stream: false });

        const workspaceInfo = {
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

        return res.status(200).json({ info: 'successfully fetched container info.', workspaceInfo })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ warn: `Error getting container info ${error}` })
    }
}

module.exports = { getWorkspaceInfo }
