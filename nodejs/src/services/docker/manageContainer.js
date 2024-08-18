require('dotenv').config({ path: '../../../.env' });

const Docker = require('dockerode');
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock'||  '//./pipe/docker_engine'});

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

const execCommandInContainer = async (containerId, command) => {
    const container = docker.getContainer(containerId);

    try {
        // Start the command execution inside the container
        let exec = await container.exec({
            Cmd: ['sh', '-c', command],
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });

        let stream = await exec.start({ hijack: true });

        // Return a promise that resolves or rejects based on the stream's events
        return new Promise((resolve, reject) => {
            let stdout = '';
            let stderr = '';

            stream.on('data', (data) => {
                console.log(data.toString())
                stdout += data.toString(); // Collect stdout data
            });

            stream.on('error', (error) => {
                stderr += error.toString(); // Collect stderr data
                reject(new Error(`Error executing command '${command}': ${stderr}`));
            });

            stream.on('end', () => {
                if (stderr) {
                    reject(new Error(`Error executing command '${command}': ${stderr}`));
                } else {
                    resolve(stdout); // Resolve with stdout data
                }
            });
        });
    } catch (error) {
        console.error(`Failed to execute command '${command}' in container '${containerId}': ${error}`);
        throw new Error(`Failed to execute command '${command}' in container '${containerId}': ${error.message}`);
    }
};


module.exports = { containerDetails , execCommandInContainer}
