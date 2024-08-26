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

const createWorkspaceContainer = async (user, memory, nanoCpus, storage, containerName, volumeName, workspaceName) => {
    try {
        const codeServerPort = process.env.CODESERVER_PORT || 8080;
        const mainServerPort = process.env.MAINSERVER_PORT || 7777;
        const dev3000Port = process.env.DEV_3000_PORT || 3000;
        const dev5000Port = process.env.DEV_5000_PORT || 5000;
        const dev8000Port = process.env.DEV_8000_PORT || 8000;

        const Memory = memory || process.env.DEFAULT_CONTAINER_MEMORY;
        const NanoCpus = nanoCpus || process.env.DEFAULT_CONTAINER_NANACPUS;
        const StorageSize = storage || process.env.DEFAULT_CONTAINER_STORAGE

        let volume, container;

        const codeServerSubdomain = `${user.username}-${workspaceName}-codeserver`;
        const mainServerSubdomain = `${user.username}-${workspaceName}-mainserver`;
        const dev3000ServerSubdomain = `${user.username}-${workspaceName}-dev3000server`;
        const dev5000ServerSubdomain = `${user.username}-${workspaceName}-dev5000server`;

        const generalAuthString = await generateBasicAuth(`${user.username}`, `${user.username}`);
        const mainserverAuthString = generalAuthString
        const codeserverAuthString = generalAuthString
        const dev3000serverAuthString = generalAuthString
        const dev5000serverAuthString = generalAuthString
        volume = await docker.createVolume({
            Name: volumeName,
            // DriverOpts: {
            //     'type': 'tmpfs',  // using tmpfs for in-memory storage
            //     'device': 'tmpfs',
            //     'o': `size=${StorageSize}m` 
            // }
        });
        
        if (!volume) {
            throw new Error(`Failed to create volume for ${user.username}`);
        }
        console.log(`${codeServerSubdomain}.${WILDCARD_DOMAIN}`, 'wildcard subdoamin')

        let password = '1234'
        container = await docker.createContainer({
            Image: `${process.env.WORKSPACE_BASE_IMAGE_NAME}:${process.env.WORKSPACE_BASE_IMAGE_VERSION}`,
            name: containerName,
            // Cmd: ['sh', '-c', 'while :; do sleep 2073600; done'],
            Cmd: ['sh', '-c', 'code-server --bind-addr 0.0.0.0:8080 --auth password --disable-telemetry --user-data-dir /project/.vscode'],
            Env: [
                `PASSWORD=${password}`
            ],
            HostConfig: {
                NanoCpus: NanoCpus,
                Memory: Memory,
                Binds: [`${volumeName}:/root`],
                NetworkMode: process.env.WORKSPACE_NETWORK_MODE,
                // StorageOpt: {
                //     'size': StorageSize
                // }
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
            Labels: {
                "traefik.enable": "true",
                // main-server
                // [`traefik.http.routers.mainserver.entrypoints`]: "http, https",
                // [`traefik.http.routers.mainserver.rule`]: `Host(\`${mainServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                // [`traefik.http.middlewares.mainserver-https-redirect.redirectscheme.scheme`]: "https",
                // [`traefik.http.routers.mainserver-secure.rule`]: `Host(\`${mainServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                // [`traefik.http.routers.mainserver-secure.tls`]: "true",
                // [`traefik.http.routers.mainserver-secure.tls.certresolver`]: "cloudflare",
                // [`traefik.http.routers.mainserver.service`]: `mainserver_service`,
                // [`traefik.http.services.mainserver_service.loadbalancer.server.port`]: `${mainServerPort}`,
                // [`traefik.http.routers.mainserver.middlewares`]: `mainserver_auth`,
                // [`traefik.http.middlewares.mainserver_auth.basicauth.users`]: `${mainserverAuthString}`,

                // code-server    
                [`traefik.http.routers.${codeServerSubdomain}.entrypoints`]: "http",
                [`traefik.http.routers.${codeServerSubdomain}.rule`]: `Host(\`${codeServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                [`traefik.http.middlewares.${codeServerSubdomain}-https-redirect.redirectscheme.scheme`]: "https",
                [`traefik.http.routers.${codeServerSubdomain}-secure.rule`]: `Host(\`${codeServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                [`traefik.http.routers.${codeServerSubdomain}-secure.entrypoints`]: "https",
                [`traefik.http.routers.${codeServerSubdomain}-secure.tls`]: "true",
                [`traefik.http.routers.${codeServerSubdomain}-secure.tls.certresolver`]: "cloudflare",
                [`traefik.http.routers.${codeServerSubdomain}.service`]: `${codeServerSubdomain}_service`,
                [`traefik.http.services.${codeServerSubdomain}_service.loadbalancer.server.port`]: `${codeServerPort}`,


                // [`traefik.http.routers.${codeServerSubdomain}.middlewares`]: `${codeServerSubdomain}_auth`,
                // [`traefik.http.middlewares.${codeServerSubdomain}_auth.basicauth.users`]: `${codeserverAuthString}`,

                // development server on port 3000
                // [`traefik.http.routers.${codeServerSubdomain}.entrypoints`]: "http, https",
                // [`traefik.http.routers.${codeServerSubdomain}.rule`]: `Host(\`${dev3000ServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                // [`traefik.http.middlewares.${codeServerSubdomain}-https-redirect.redirectscheme.scheme`]: "https",
                // [`traefik.http.routers.${codeServerSubdomain}-secure.rule`]: `Host(\`${codeServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                // [`traefik.http.routers.${codeServerSubdomain}-secure.tls`]: "true",
                // [`traefik.http.routers.${codeServerSubdomain}-secure.tls.certresolver`]: "cloudflare",
                // [`traefik.http.routers.dev3000s${codeServerSubdomain}erver.service`]: `${codeServerSubdomain}_service`,
                // [`traefik.http.services.${codeServerSubdomain}_service.loadbalancer.server.port`]: `${dev3000Port}`,
                // [`traefik.http.routers.${codeServerSubdomain}.middlewares`]: `${codeServerSubdomain}_auth`,
                // [`traefik.http.middlewares.${codeServerSubdomain}_auth.basicauth.users`]: `${dev3000serverAuthString}`,

                // development server on port 5000
                // [`traefik.http.routers.dev5000server.entrypoints`]: "http, https",
                // [`traefik.http.routers.dev5000server.rule`]: `Host(\`${dev5000ServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                // [`traefik.http.middlewares.dev5000server-https-redirect.redirectscheme.scheme`]: "https",
                // [`traefik.http.routers.dev5000server-secure.rule`]: `Host(\`${dev5000ServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                // [`traefik.http.routers.dev5000server-secure.tls`]: "true",
                // [`traefik.http.routers.dev5000server-secure.tls.certresolver`]: "cloudflare",
                // [`traefik.http.routers.dev5000server.service`]: `dev5000server_service`,
                // [`traefik.http.services.dev5000server_service.loadbalancer.server.port`]: `${dev5000Port}`,
                // [`traefik.http.routers.dev5000server.middlewares`]: `dev5000server_auth`,
                // [`traefik.http.middlewares.dev5000server_auth.basicauth.users`]: `${dev5000serverAuthString}`,
            },
        });

        

        //  container = await docker.createContainer({
        //     Image: `${process.env.WORKSPACE_BASE_IMAGE_NAME}:${process.env.WORKSPACE_BASE_IMAGE_VERSION}`,
        //     name: containerName,
        //     Cmd: ['sh', '-c', 'while :; do sleep 2073600; done'],
        //     HostConfig: {
        //         NanoCpus: NanoCpus,
        //         Memory: Memory,
        //         Binds: [`${volumeName}:/root`],
        //         NetworkMode: process.env.WORKSPACE_NETWORK_MODE,
        //         // StorageOpt: {
        //         //     'size': StorageSize
        //         // }
        //     },
        //     ExposedPorts: {
        //         "80/tcp": {},
        //         "443/tcp": {},
        //         [`${codeServerPort}/tcp`]: {},
        //         [`${mainServerPort}/tcp`]: {},
        //         [`${dev3000Port}/tcp`]: {},
        //         [`${dev5000Port}/tcp`]: {},
        //         [`${dev8000Port}/tcp`]: {},
        //     },
        //     Env: [
        //         `PASSWORD=1234`,
        //     ],
        //     Labels: {
        //         "traefik.enable": "true",
            
        //         // HTTP router configuration for code server
        //         [`traefik.http.routers.${codeServerSubdomain}.entrypoints`]: "http",
        //         [`traefik.http.routers.${codeServerSubdomain}.rule`]: `Host(\`${codeServerSubdomain}.bycontrolia.com\`)`,
        //         [`traefik.http.middlewares.${codeServerSubdomain}-https-redirect.redirectscheme.scheme`]: "https",
            
        //         // HTTPS router configuration for code server
        //         [`traefik.http.routers.${codeServerSubdomain}-secure.entrypoints`]: "https",
        //         [`traefik.http.routers.${codeServerSubdomain}-secure.rule`]: `Host(\`${codeServerSubdomain}.bycontrolia.com\`)`,
        //         [`traefik.http.routers.${codeServerSubdomain}-secure.tls`]: "true",
        //         [`traefik.http.routers.${codeServerSubdomain}-secure.tls.certresolver`]: "cloudflare",
            
        //         // Service configuration for code server
        //         [`traefik.http.routers.${codeServerSubdomain}.service`]: `${codeServerSubdomain}_service`,
        //         [`traefik.http.services.${codeServerSubdomain}_service.loadbalancer.server.port`]: `${codeServerPort}`,
            
        //         // HTTP router configuration for port 3000
        //         [`traefik.http.routers.${dev3000ServerSubdomain}.entrypoints`]: "http",
        //         [`traefik.http.routers.${dev3000ServerSubdomain}.rule`]: `Host(\`${dev3000ServerSubdomain}.bycontrolia.com\`)`,
        //         [`traefik.http.middlewares.${dev3000ServerSubdomain}-https-redirect.redirectscheme.scheme`]: "https",
            
        //         // HTTPS router configuration for port 3000
        //         [`traefik.http.routers.${dev3000ServerSubdomain}-secure.entrypoints`]: "https",
        //         [`traefik.http.routers.${dev3000ServerSubdomain}-secure.rule`]: `Host(\`${dev3000ServerSubdomain}.bycontrolia.com\`)`,
        //         [`traefik.http.routers.${dev3000ServerSubdomain}-secure.tls`]: "true",
        //         [`traefik.http.routers.${dev3000ServerSubdomain}-secure.tls.certresolver`]: "cloudflare",
            
        //         // Service configuration for port 3000
        //         [`traefik.http.routers.${dev3000ServerSubdomain}.service`]: `${dev3000ServerSubdomain}_service`,
        //         [`traefik.http.services.${dev3000ServerSubdomain}_service.loadbalancer.server.port`]:`${dev3000Port}`,
            
        //         // HTTP router configuration for port 5000
        //         [`traefik.http.routers.${dev5000ServerSubdomain}.entrypoints`]: "http",
        //         [`traefik.http.routers.${dev5000ServerSubdomain}.rule`]: `Host(\`${dev5000ServerSubdomain}.bycontrolia.com\`)`,
        //         [`traefik.http.middlewares.${dev5000ServerSubdomain}-https-redirect.redirectscheme.scheme`]: "https",
            
        //         // HTTPS router configuration for port 5000
        //         [`traefik.http.routers.${dev5000ServerSubdomain}-secure.entrypoints`]: "https",
        //         [`traefik.http.routers.${dev5000ServerSubdomain}-secure.rule`]: `Host(\`${dev5000ServerSubdomain}.bycontrolia.com\`)`,
        //         [`traefik.http.routers.${dev5000ServerSubdomain}-secure.tls`]: "true",
        //         [`traefik.http.routers.${dev5000ServerSubdomain}-secure.tls.certresolver`]: "cloudflare",
            
        //         // Service configuration for port 5000
        //         [`traefik.http.routers.${dev5000ServerSubdomain}.service`]: `${dev5000ServerSubdomain}_service`,
        //         [`traefik.http.services.${dev5000ServerSubdomain}_service.loadbalancer.server.port`]:`${dev5000Port}`,
        //     }            
        // });
        

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
