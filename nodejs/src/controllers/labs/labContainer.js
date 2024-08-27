require('dotenv').config({ path: '../../../.env' });
const Docker = require('dockerode');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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

function generatePasswordHash(labPassword) {
    const hash = crypto.createHash('sha1');
    hash.update(labPassword);
    const hashedPassword = hash.digest('hex');
    
    return `sha1:${hashedPassword}`;
}


const createLabContainer = async (user, memory, nanoCpus, storage, containerName, volumeName, labName,labUsername, labPassword) => {
    try {
        const labServerPort = process.env.LABSERVER_PORT || 8888;

        const Memory = memory || process.env.DEFAULT_CONTAINER_MEMORY;
        const NanoCpus = nanoCpus || process.env.DEFAULT_CONTAINER_NANACPUS;
        const StorageSize = storage || process.env.DEFAULT_CONTAINER_STORAGE;

        let volume, container;

        const labServerSubdomain = `${user.username}-${labName}-labserver`;
        const labServerAuthString = await generateBasicAuth(labUsername, labPassword);

        volume = await docker.createVolume({ Name: volumeName });
        if (!volume) {
            throw new Error(`Failed to create volume for ${user.username}`);
        }

        const NOTEBOOK_DIR = `/root`;
        const LOGS_DIR = `/root`;

        const JUPYTER_HASHED_PASSWORD = generatePasswordHash(labPassword)
        
        container = await docker.createContainer({
            Image: `${process.env.LAB_BASE_IMAGE_NAME}:${process.env.LAB_BASE_IMAGE_VERSION}`,
            name: containerName,
            // Cmd: ['sh', '-c', `nohup jupyter notebook --no-browser --ip=0.0.0.0 --port=${labServerPort} --notebook-dir=${NOTEBOOK_DIR} --allow-root > ${LOGS_DIR}/jupyter.log 2>&1 & echo $!`],

            // Env: [
            //     `PASSWORD=${JUPYTER_HASHED_PASSWORD}`
            //   ],

            // Cmd: ['sh', '-c', `jupyter notebook --no-browser --ip=0.0.0.0 --port=${labServerPort} --notebook-dir=${NOTEBOOK_DIR} --allow-root`],
           

            Cmd: ['sh', '-c', `jupyter notebook --no-browser --ip=0.0.0.0 --port=${labServerPort} --notebook-dir=${NOTEBOOK_DIR} --allow-root --NotebookApp.token='' --NotebookApp.password=''`],

            HostConfig: {
                NanoCpus: NanoCpus,
                Memory: Memory,
                Binds: [`${volumeName}:/root`],
                NetworkMode: process.env.LAB_NETWORK_MODE,
            },
            ExposedPorts: {
                "80/tcp": {},
                "443/tcp": {},
                [`${labServerPort}/tcp`]: {},
            },
            Labels: {
                "traefik.enable": "true",
                [`traefik.http.routers.${labServerSubdomain}.entrypoints`]: "http,https",
                [`traefik.http.routers.${labServerSubdomain}.rule`]: `Host(\`${labServerSubdomain}.${WILDCARD_DOMAIN}\`)`,
                [`traefik.http.routers.${labServerSubdomain}.tls`]: "true",
                [`traefik.http.routers.${labServerSubdomain}.tls.certresolver`]: "cloudflare",
                [`traefik.http.routers.${labServerSubdomain}.service`]: `${labServerSubdomain}-service`,
                [`traefik.http.services.${labServerSubdomain}-service.loadbalancer.server.port`]: `${labServerPort}`,
                [`traefik.http.routers.${labServerSubdomain}.middlewares`]: `${labServerSubdomain}-auth`,
                [`traefik.http.middlewares.${labServerSubdomain}-auth.basicauth.users`]: `${labServerAuthString}`,
            },
        });

        if (!container) {
            throw new Error(`Failed to create new lab container for ${user.username}`);
        }

        await container.start();

        return {
            container,
            volume,
            subdomains: {
                labServer: labServerSubdomain,
            },
            ports: {
                labServerPort: labServerPort,
            },
            authStrings: {
                labServerAuthString,
            }
        };

    } catch (err) {
        console.error(`Error occurred during lab container creation: ${err}`);
        throw new Error(`Lab container creation error: ${err}`);
    }
};

module.exports = { createLabContainer };
