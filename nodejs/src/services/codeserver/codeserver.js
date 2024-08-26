require('dotenv').config({ path: '../../../.env' });
const Docker = require('dockerode');

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock' });

const createCodeServerImage = async (imageName) => {
    try {
        await docker.getImage(imageName).inspect();
        console.log(`Image ${imageName} already exists locally.`);
    } catch (err) {
        if (err.statusCode === 404) {
            console.log(`Image ${imageName} not found locally. Pulling the image...`);
            await new Promise((resolve, reject) => {
                docker.pull(imageName, (err, stream) => {
                    if (err) {
                        return reject(err);
                    }
                    docker.modem.followProgress(stream, (err, res) => {
                        return err ? reject(err) : resolve(res);
                    });
                });
            });
            console.log(`Successfully pulled the image ${imageName}`);
        } else {
            throw err;
        }
    }
};

const startCodeServer = async (req, res) => {
    try {
        const containerName = 'code-server';
        const imageName = 'controlia_workspace_image:1';

        // Check if the codeserver container already exists
        const containers = await docker.listContainers({ all: true });
        const codeServerContainer = containers.find(container => container.Names.some(name => name === `/${containerName}`));

        await createCodeServerImage(imageName);

        if (codeServerContainer) {
            return res.send('Code-server container already exists.');
        }

        const codeserver_server_subdomain = 'codeserver-dashboard';
        const password = '1234';

        // Create and start the codeserver container if not present
        const containerOptions = {
            Image: imageName,
            name: containerName,
            Cmd: ['sh', '-c', 'code-server --bind-addr 0.0.0.0:8080 --auth password --disable-telemetry --user-data-dir /project/.vscode'],
            Env: [
                `PASSWORD=${password}`
            ],
            ExposedPorts: {
                '8080/tcp': {}
            },
            HostConfig: {
                NetworkMode: 'web', // Ensure 'web' network exists
                Binds: [
                    '/var/run/docker.sock:/var/run/docker.sock' // Mount the Docker socket
                ]
            },
            Labels: {
                "traefik.enable": "true",

                // HTTP router configuration
                [`traefik.http.routers.${codeserver_server_subdomain}.entrypoints`]: "http",
                [`traefik.http.routers.${codeserver_server_subdomain}.rule`]: `Host(\`${codeserver_server_subdomain}.bycontrolia.com\`)`,
                [`traefik.http.middlewares.${codeserver_server_subdomain}-https-redirect.redirectscheme.scheme`]: "https",

                // HTTPS router configuration
                [`traefik.http.routers.${codeserver_server_subdomain}-secure.entrypoints`]: "https",
                [`traefik.http.routers.${codeserver_server_subdomain}-secure.rule`]: `Host(\`${codeserver_server_subdomain}.bycontrolia.com\`)`,
                [`traefik.http.routers.${codeserver_server_subdomain}-secure.tls`]: "true",
                [`traefik.http.routers.${codeserver_server_subdomain}-secure.tls.certresolver`]: "cloudflare",

                // Service configuration
                [`traefik.http.routers.${codeserver_server_subdomain}.service`]: `${codeserver_server_subdomain}`,
                [`traefik.http.services.${codeserver_server_subdomain}.loadbalancer.server.port`]: "8080"
            }
        };

        const container = await docker.createContainer(containerOptions);
        await container.start();

        res.send('Code-server container created and started successfully.');
    } catch (error) {
        console.error('Error setting up code-server container:', error);
        res.status(500).send(`Failed to set up code-server container. ${error}`);
    }
};

module.exports = { startCodeServer };
