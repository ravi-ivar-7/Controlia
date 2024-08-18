require('dotenv').config({ path: '../../../.env' });
const Docker = require('dockerode');

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock' });

const startPortainer = async (req, res) => {
    try {
        const containerName = 'portainer';
        const imageName = 'portainer/portainer-ce:latest'; // Use the latest Portainer Community Edition image

        // Check if the Portainer container already exists
        const containers = await docker.listContainers({ all: true });
        const portainerContainer = containers.find(container => container.Names.some(name => name === `/${containerName}`));

        if (portainerContainer) {
            return res.send('Portainer container already exists.');
        }

        const portainer_server_subdomain = 'portainer-dashboard';
        const adminUsername = 'admin'; 
        const adminPassword = 'adminpassword'; 

        // Create and start the Portainer container if not present
        const containerOptions = {
            Image: imageName,
            name: containerName,
            Env: [
                `ADMIN_USER=${adminUsername}`, // Set the admin username
                `ADMIN_PASSWORD=${adminPassword}` // Set the admin password
            ],
            ExposedPorts: {
                '9000/tcp': {}
            },
            HostConfig: {
                NetworkMode: 'web',
                Binds: [
                    '/var/run/docker.sock:/var/run/docker.sock' // Mount the Docker socket
                ]
            },
            Labels: {
                "traefik.enable": "true",

                // HTTP router configuration
                [`traefik.http.routers.${portainer_server_subdomain}.entrypoints`]: "http",
                [`traefik.http.routers.${portainer_server_subdomain}.rule`]: `Host(\`${portainer_server_subdomain}.bycontrolia.com\`)`,
                [`traefik.http.middlewares.${portainer_server_subdomain}-https-redirect.redirectscheme.scheme`]: "https",

                // HTTPS router configuration
                [`traefik.http.routers.${portainer_server_subdomain}-secure.entrypoints`]: "https",
                [`traefik.http.routers.${portainer_server_subdomain}-secure.rule`]: `Host(\`${portainer_server_subdomain}.bycontrolia.com\`)`,
                [`traefik.http.routers.${portainer_server_subdomain}-secure.tls`]: "true",
                [`traefik.http.routers.${portainer_server_subdomain}-secure.tls.certresolver`]: "cloudflare",

                // Service configuration
                [`traefik.http.routers.${portainer_server_subdomain}.service`]: `${portainer_server_subdomain}`,
                [`traefik.http.services.${portainer_server_subdomain}.loadbalancer.server.port`]: "9000"
            }
        };

        const container = await docker.createContainer(containerOptions);
        await container.start();

        res.send('Portainer container created and started successfully.');
    } catch (error) {
        console.error('Error setting up Portainer container:', error);
        res.status(500).send('Failed to set up Portainer container.');
    }
};

module.exports = {startPortainer}
