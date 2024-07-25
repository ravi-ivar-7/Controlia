const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });
require('dotenv').config({ path: '../../../.env' });

const  containerDetails = async (containerId) => {
    try {

        const getcontainer = docker.getContainer(containerId);
        const data = await getcontainer.inspect();
        const stats = await getcontainer.stats({ stream: false });
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

        return json({info:'successfully fetched container info.', containerInfo})
    } catch (error) {
        return rjson({warn: `Error getting container info ${error}`})
    }
}

const execInContainer = async (containerId, cmd) => {
    const container = docker.getContainer(containerId);

    try {
        let exec = await container.exec({
            Cmd: cmd,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });

        let response = await exec.start({ hijack: true });

        let output = '';
        response.on('data', (data) => {
            output += data.toString();
        });

        response.on('error', (error) => {
            console.error('Exec error:', error.toString());
        });

        await new Promise((resolve) => {
            response.on('end', resolve);
        });

        return output;
    } catch (error) {
        console.error(`Failed to execute command '${cmd.join(' ')}' in container '${containerId}': ${error}`);
        throw error;
    }
};

module.exports = { containerDetails , execInContainer}
