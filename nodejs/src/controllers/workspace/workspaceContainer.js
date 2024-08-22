require('dotenv').config({ path: '../../../.env' });
const Docker = require('dockerode');
const bcrypt = require('bcryptjs');
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock' });

const WILDCARD_DOMAIN = process.env.WILDCARD_DOMAIN || 'bycontrolia.com';

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

const createWorkspaceContainer = async (user, memory, nanoCpus, containerName,volumeName, workspaceName) => {
    try {
        const codeServerPort = process.env.CODESERVER_PORT || 8080;
        const mainServerPort = process.env.MAINSERVER_PORT || 7777;
        const dev3000Port = process.env.DEV_3000_PORT || 3000;
        const dev5000Port = process.env.DEV_5000_PORT || 5000;
        const dev8000Port = process.env.DEV_8000_PORT || 8000;

        const Memory = memory || process.env.DEFAULT_CONTAINER_MEMORY;
        const NanoCpus = nanoCpus || process.env.DEFAULT_CONTAINER_NANACPUS;

        let volume, container;

        const codeServerSubdomain = `${user.username}_${workspaceName}_codeserver`;
        const mainServerSubdomain = `${user.username}_${workspaceName}_mainserver`;
        const dev3000ServerSubdomain = `${user.username}_${workspaceName}_dev3000server`;
        const dev5000ServerSubdomain = `${user.username}_${workspaceName}_dev5000server`;

        const mainserverAuthString = await generateBasicAuth(`${user.username}_mainserver`, `${user.username}_password`);
        const codeserverAuthString = await generateBasicAuth(`${user.username}_codeserver`, `${user.username}_password`);
        const dev3000serverAuthString = await generateBasicAuth(`${user.username}_dev3000server`, `${user.username}_password`);
        const dev5000serverAuthString = await generateBasicAuth(`${user.username}_dev5000server`, `${user.username}_password`);

        volume = await docker.createVolume({ Name: volumeName });
        if (!volume) {
            throw new Error(`Failed to create volume for ${user.username}`);
        }

        container = await docker.createContainer({
            Image: `${process.env.BASE_IMAGE_NAME}:${process.env.BASE_IMAGE_VERSION}`,
            name: containerName,
            Cmd: ['sh', '-c', 'while :; do sleep 2073600; done'],
            HostConfig: {
                NanoCpus: NanoCpus,
                Memory: Memory,
                Binds: [`${volumeName}:/root`],
                NetworkMode: 'controlia_web',
            },
            ExposedPorts: {
                "80/tcp": {},
                "443/tcp": {},
                [`${codeServerPort}/tcp`]: {},
                [`${mainServerPort}/tcp`]: {},
                [`${dev3000Port}/tcp`]: {},
                [`${dev5000Port}/tcp`]: {},
                [`${dev8000Port}/tcp`]: {},
            },
            Env: [
                `USERNAME=${user.username}`,
            ],
            Labels: {
                "traefik.enable": "true",
                // main-server
                [`traefik.http.routers.mainserver.entrypoints`]: "http, https",
                [`traefik.http.routers.mainserver.rule`]: `Host(\`${mainServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                [`traefik.http.middlewares.mainserver-https-redirect.redirectscheme.scheme`]: "https",
                [`traefik.http.routers.mainserver-secure.rule`]: `Host(\`${mainServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                [`traefik.http.routers.mainserver-secure.tls`]: "true",
                [`traefik.http.routers.mainserver-secure.tls.certresolver`]: "cloudflare",
                [`traefik.http.routers.mainserver.service`]: `mainserver_service`,
                [`traefik.http.services.mainserver_service.loadbalancer.server.port`]: `${mainServerPort}`,
                [`traefik.http.routers.mainserver.middlewares`]: `mainserver_auth`,
                [`traefik.http.middlewares.mainserver_auth.basicauth.users`]: `${mainserverAuthString}`,
                // code-server
                [`traefik.http.routers.codeserver.entrypoints`]: "http, https",
                [`traefik.http.routers.codeserver.rule`]: `Host(\`${codeServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                [`traefik.http.middlewares.codeserver-https-redirect.redirectscheme.scheme`]: "https",
                [`traefik.http.routers.codeserver-secure.rule`]: `Host(\`${codeServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                [`traefik.http.routers.codeserver-secure.tls`]: "true",
                [`traefik.http.routers.codeserver-secure.tls.certresolver`]: "cloudflare",
                [`traefik.http.routers.codeserver.service`]: `codeserver_service`,
                [`traefik.http.services.codeserver_service.loadbalancer.server.port`]: `${codeServerPort}`,
                [`traefik.http.routers.codeserver.middlewares`]: `codeserver_auth`,
                [`traefik.http.middlewares.codeserver_auth.basicauth.users`]: `${codeserverAuthString}`,
                // development server on port 3000
                [`traefik.http.routers.dev3000server.entrypoints`]: "http, https",
                [`traefik.http.routers.dev3000server.rule`]: `Host(\`${dev3000ServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                [`traefik.http.middlewares.dev3000server-https-redirect.redirectscheme.scheme`]: "https",
                [`traefik.http.routers.dev3000server-secure.rule`]: `Host(\`${dev3000ServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                [`traefik.http.routers.dev3000server-secure.tls`]: "true",
                [`traefik.http.routers.dev3000server-secure.tls.certresolver`]: "cloudflare",
                [`traefik.http.routers.dev3000server.service`]: `dev3000server_service`,
                [`traefik.http.services.dev3000server_service.loadbalancer.server.port`]: `${dev3000Port}`,
                [`traefik.http.routers.dev3000server.middlewares`]: `dev3000server_auth`,
                [`traefik.http.middlewares.dev3000server_auth.basicauth.users`]: `${dev3000serverAuthString}`,
                // development server on port 5000
                [`traefik.http.routers.dev5000server.entrypoints`]: "http, https",
                [`traefik.http.routers.dev5000server.rule`]: `Host(\`${dev5000ServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                [`traefik.http.middlewares.dev5000server-https-redirect.redirectscheme.scheme`]: "https",
                [`traefik.http.routers.dev5000server-secure.rule`]: `Host(\`${dev5000ServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                [`traefik.http.routers.dev5000server-secure.tls`]: "true",
                [`traefik.http.routers.dev5000server-secure.tls.certresolver`]: "cloudflare",
                [`traefik.http.routers.dev5000server.service`]: `dev5000server_service`,
                [`traefik.http.services.dev5000server_service.loadbalancer.server.port`]: `${dev5000Port}`,
                [`traefik.http.routers.dev5000server.middlewares`]: `dev5000server_auth`,
                [`traefik.http.middlewares.dev5000server_auth.basicauth.users`]: `${dev5000serverAuthString}`,
            },
        });

        if (!container) {
            throw new Error(`Failed to create new workspace container for ${user.username}`);
        }

        await container.start();

        return {
            container,
            volume,
            subdomains: {
                codeServer: codeServerSubdomain,
                mainServer: mainServerSubdomain,
                dev3000Server: dev3000ServerSubdomain,
                dev5000Server: dev5000ServerSubdomain,
            },
            ports: {
                codeServerPort: codeServerPort,
                mainServerPort: mainServerPort,
                dev3000Port: dev3000Port,
                dev5000Port: dev5000Port,
                dev8000Port: dev8000Port,
            },
            authStrings: {
                mainserverAuthString,
                codeserverAuthString,
                dev3000serverAuthString,
                dev5000serverAuthString,
            }
        };
        
    } catch (err) {
        console.log(`Error occured duing workspace container creation: ${err}`)
        throw new Error(`workspace container creation error: ${err}`)
    }

};

module.exports = { createWorkspaceContainer };
