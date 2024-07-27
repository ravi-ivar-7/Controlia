require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/logs/winstonLogger');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

const jupyterServer = async (io, socket, data) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let container;
    let pid;
    let token;
    let url;

    try {
        const decodedToken = socket.decodedToken;
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const jupytersServerCollection = db.collection('juptersServer');
        const user = await usersCollection.findOne({ userId: decodedToken.userId });
        const jupyterServer = await jupytersServerCollection.findOne({ userId: decodedToken.userId });

        if (!user) {
            io.to(socket.decodedToken.userId).emit('jupyterWarn', { warn: 'User not found' });
            return;
        }

        const containerId = user.containerId;
        const NOTEBOOK_DIR = `/${user.userId}/notebooks`;
        const LOGS_DIR = `/${user.userId}/temp`;

        container = docker.getContainer(containerId);

        // Kill any existing Jupyter server
        if (jupyterServer && jupyterServer.pid) {
            const execKill = await container.exec({
                Cmd: ['sh', '-c', `kill -9 ${jupyterServer.pid}`],
                AttachStdout: true,
                AttachStderr: true,
                Tty: false,
            });
             execKill.start();
             io.to(socket.decodedToken.userId).emit('jupyterWarn', { warn: `Stopped previous server with pid: ${jupyter.pid}` });
        }

        // Start Jupyter server with nohup
        const exec = await container.exec({
            Cmd: ['sh', '-c', `nohup jupyter notebook --no-browser --ip=0.0.0.0 --port=8888 --notebook-dir=${NOTEBOOK_DIR} --allow-root > ${LOGS_DIR}/jupyter.log 2>&1 & echo $!`],
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
        });

        const stream = await exec.start();
        stream.on('data', (data) => {
            const output = data.toString().replace(/[^\x20-\x7E]/g, '').trim();

            const pidMatch = output.match(/^\d+$/);
            if (pidMatch) {
                pid = parseInt(pidMatch[0], 10);
                io.to(socket.decodedToken.userId).emit('jupyterOutput', { output: `Server started with pid ${pid}` });
            }
        });

        stream.on('error', (err) => {
            const warn = err.toString().replace(/[^\x20-\x7E]/g, '').trim();
            io.to(socket.decodedToken.userId).emit('jupyterWarn', { warn });
        });

        // Wait for server to start and logs to be written
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Read the log file to extract the URL and token
        const execLogs = await container.exec({
            Cmd: ['sh', '-c', `cat ${LOGS_DIR}/jupyter.log`],
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
        });

        const logStream = await execLogs.start();
        logStream.on('data', (data) => {
            const output = data.toString();
            io.to(socket.decodedToken.userId).emit('jupyterOutput', { output });

            const tokenMatch = output.match(/token=([a-f0-9]{32,})/);
            if (tokenMatch) {
                token = tokenMatch[1];
                io.to(socket.decodedToken.userId).emit('jupyterConnection', { token });
            }

            const urlRegex = /http:\/\/127.0.0.1:\d+[^\s]*token=[a-f0-9]{32,}/g;
            const urlMatch = output.match(urlRegex);
            if (urlMatch) {
                url = `http://${process.env.HTTP_HOST}:${user.hostPort8888}/tree?token=${token}`;
                io.to(socket.decodedToken.userId).emit('jupyterConnection', { url });
            }
        });

        logStream.on('error', (err) => {
            const warn = err.toString().replace(/[^\x20-\x7E]/g, '').trim();
            console.error(warn);
            io.to(socket.decodedToken.userId).emit('jupyterWarn', { warn });
        });

        await new Promise((resolve) => {
            logStream.on('end', resolve);
        });

        const jupyterUpdateFields = {
            userId:user.userId,
            email:user.email,
            name:user.name,
            containerName: user.containerName,
            volumeName: user.volumeName,
            pid: pid,
            token: token,
            url: url,
            startTime: new Date(),
        };
        await jupytersServerCollection.findOneAndUpdate({ userId: decodedToken.userId }, { $set: jupyterUpdateFields }, { upsert: true });

        io.to(socket.decodedToken.userId).emit('jupyterOutput', { output: 'started...' });

    } catch (error) {
        logger.error(`ERROR STARTING JUPYTER SERVER: ${error}`);
        return io.to(socket.decodedToken.userId).emit('jupyterWarn', { warn: 'An error occurred during server startup', details: error.toString() });
    } finally {
        await client.close();
    }
};

module.exports = { jupyterServer };
