require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });
const { base62 } = require('base-id');

const findFreePortDetails = (ports) => {
    for (const [port, portDetails] of Object.entries(ports)) {
        if (portDetails.status === 'free') {
            return {
                port: port,
                portDetails: portDetails,
            };
        }
    }
    return 'No free ports available';
};

const deployProject = async (io, socket, data) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let container;
    try {

        const decodedToken = socket.decodedToken;
        const { selectedRepo, installCommand, startServerCommand , framework} = data;
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const projectsContainerCollection = db.collection('projectsContainer');
        const projectsCollection = db.collection('projects')

        const user = await usersCollection.findOne({ userId: decodedToken.userId });
        if (!user) {
            io.to(socket.decodedToken.userId).emit('projectError', { error: 'User not found' });
            return;
        }

        const alreadyDeployed = await projectsCollection.findOne({ userId: decodedToken.userId, projectName: selectedRepo.name })
        if (alreadyDeployed) {
            io.to(socket.decodedToken.userId).emit('projectError', { error: `${selectedRepo.name}  is already deployed. Delete or update from projects dashboard.` });
            return;
        }

        io.to(socket.decodedToken.userId).emit('projectOutput', { output: 'starting...' });


        const PROJECT_DIR = `${user.userId}/${selectedRepo.name}`
        container = docker.getContainer(user.projectContainerId);

        console.log('installing packages');
        io.to(socket.decodedToken.userId).emit('projectOutput', { output: 'installing...' });
        let exec = await container.exec({
            Cmd: ['sh', '-c', `cd ${PROJECT_DIR} && ${installCommand}`],
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });

        let response = await exec.start({ hijack: true });

        response.on('data', (data) => {
            io.to(socket.decodedToken.userId).emit('projectOutput', { output: data.toString() });
        });

        response.on('error', (error) => {
            console.error('Exec error:', error.toString());
            return io.to(socket.decodedToken.userId).emit('projectError', { error: error.toString() });
        });

        await new Promise((resolve) => {
            response.on('end', resolve);
        });
        console.log('starting server');

        io.to(socket.decodedToken.userId).emit('projectOutput', { output: 'Starting server...' });

        // find free or same port to start project
        const projectsContainerInfo = await projectsContainerCollection.findOne({ userId: decodedToken.userId });
        const { port, portDetails } = findFreePortDetails(projectsContainerInfo);

        if (!port || !portDetails) {
            throw new Error('No free port found.');
        }

        const serverPort = portDetails.internalPort;
        const serverHost = '0.0.0.0';
        const projectUrl = `${serverHost}:${portDetails.externalPort}`

        console.log(portDetails);

        let serverCommand;
        if(framework === 'flask'){
            serverCommand = `${startServerCommand} --host=${serverHost} --port=${serverPort}`;
        }
        else if(framework === 'django'){
            serverCommand = `${startServerCommand} ${serverHost}:${serverPort}`;
        }
        else if(framework === 'fastapi'){
            serverCommand = `${startServerCommand} --host=${serverHost} --port=${serverPort}`;
        }
        // else if(framework === 'nodejs'){
        //     serverCommand = `${startServerCommand} --host=${serverHost} --port=${serverPort}`;
        // }
        // else if(framework === 'react'){
        //     serverCommand = `${startServerCommand} --host=${serverHost} --port=${serverPort}`;
        // }
        else{
            return io.to(socket.decodedToken.userId).emit('projectError', { error:`Unsupported framework/library: ${framework}`});
        }

        // Execute command in Docker container
        exec = await container.exec({
            Cmd: ['sh', '-c', `cd ${PROJECT_DIR} && nohup ${serverCommand} > /${PROJECT_DIR}/console.log 2>&1 & echo $!`],
            AttachStdout: true,
            AttachStderr: true,
        });

        response = await exec.start({ hijack: true });
        let output = '';
        response.on('data', (data) => {
            output += data.toString();
            io.to(socket.decodedToken.userId).emit('projectOutput', { output: data.toString() });
        });

        response.on('error', (error) => {
            return io.to(socket.decodedToken.userId).emit('projectError', { error: error.toString() });
        });

        await new Promise((resolve) => {
            response.on('end', resolve);
        });


        // Clean the output to remove non-printable characters
        const cleanedOutput = output.replace(/[^\x20-\x7E]/g, '')
        // Extract and trim the PID
        const pid = cleanedOutput.trim().split('\n').filter(line => /^\d+$/.test(line.trim()))[0];

        let projectId = await base62.generateToken(24, 'pro_');

        const projectsContainerUpdatedFields = {
            $set: {
                [`${port}`]: {
                    status: 'occupied',
                    projectName: selectedRepo.name,
                    projectId: projectId,
                    host: serverHost,
                    PID: pid
                },
                projectContainerId: container.id,
            }
        };

        const newProject = {
            userId: decodedToken.userId,
            email: decodedToken.email,
            projectContainerId: container.id,
            projectContainerName: projectsContainerInfo.containerName,
            projectVolumeName: projectsContainerInfo.volumeName,
            projectName: selectedRepo.name,
            projectId: projectId,
            pid: pid,
            projectUrl: projectUrl,
            protocol: '',
            host: serverHost,
            startTime: new Date(),
            lastChecked: new Date(),
            internalPort: portDetails.internalPort,
            externalPort: portDetails.externalPort,
            serverCommand: serverCommand,
            installCommand: installCommand,
        };

        await projectsContainerCollection.findOneAndUpdate(
            { userId: decodedToken.userId },
            projectsContainerUpdatedFields,
            { returnOriginal: false } // Optional: returns the updated document
        );

        await projectsCollection.insertOne(newProject);

        const logFilePath = `/${PROJECT_DIR}/server.log`;

        io.to(socket.decodedToken.userId).emit('projectOutput', { output: 'Server started successfully...' });
        io.to(socket.decodedToken.userId).emit('projectInfo', {  projectUrl });

        io.to(socket.decodedToken.userId).emit('projectOutput', { output: 'Now you can check logs' });

    } catch (error) {
        logger.error(`ERROR STARTING SERVER: ${error}`);
        io.to(socket.decodedToken.userId).emit('projectError', { error: 'An error occurred during server startup', details: error.toString() });
    } finally {
        await client.close();
    }
};

module.exports = { deployProject };
