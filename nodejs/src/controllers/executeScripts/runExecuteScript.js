require('dotenv').config({ path: '../../../.env' });
const { spawn } = require('child_process');
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../../services/winstonLogger')

async function writeFileAsync(filePath, data) {
    try {
        // Ensure the directory exists before writing the file
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        // Write the file
        await fs.writeFile(filePath, data);
        console.log('File written successfully:', filePath);
        return filePath;
    } catch (error) {
        console.error('Error writing file:', error);
        throw error;
    }
}
async function createDirectoryAsync(directoryPath) {
    try {
        await fs.mkdir(directoryPath, { recursive: true });
        console.log(`Directory created successfully at ${directoryPath}`);
        return directoryPath;
    } catch (error) {
        console.error('Error creating directory:', error);
        throw error;
    }
}

async function deleteFileAsync(filePath) {
    try {
        await fs.unlink(filePath);
        console.log(`File deleted successfully: ${filePath}`);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
}

async function deleteDirectoryAsync(directoryPath) {
    try {
        await fs.rm(directoryPath, { recursive: true });
        console.log(`Directory deleted successfully: ${directoryPath}`);
    } catch (error) {
        console.error(`Error deleting directory: ${directoryPath}`, error);
        throw error;
    }
}

const attachChildProcessListeners = (child, socket) => {
    return new Promise((resolve, reject) => {
        child.stdout.on('data', (data) => {
            logger.debug(`STDOUT: ${data}`);
            socket.send(JSON.stringify({ data: `${data}`, info: 'CHILD STDOUT' }));
        });

        child.stderr.on('data', (data) => {
            logger.debug(`STDERR: ${data}`);
            socket.send(JSON.stringify({ data: `${data}`, info: 'CHILD STDERR' }));
        });

        child.on('close', (code) => {
            logger.debug(`CHILD PROCESS CLOSED WITH CODE: ${code}`);
            socket.send(JSON.stringify({ data: `EXIT CODE: ${code}`, info: `CHILD CLOSE ${code}` }));
            resolve();
        });

        child.on('error', (err) => {
            logger.debug(`Child process error: ${err}`);
            socket.send(JSON.stringify({ data: `ERROR: ${err}`, info: `CHILD ERROR ${err}` }));
            reject(err);
        });
    });
};

const runExecuteScript = async (scriptInfo, decodedToken, socket) => {
    const client = new MongoClient(process.env.MONGODB_URL);

    try {
        await client.connect();
        const db = client.db("controlia");
        const scriptCollection = db.collection('executeScripts');

        const scriptDocument = await scriptCollection.findOne({ userId: decodedToken.userId, scriptId: scriptInfo.scriptId });
        if (!scriptDocument) {
            console.log('Script not found');
            socket.send(JSON.stringify({ data: 'Script not found', info: 'SCRIPT NOT FOUND' }));
            return;
        }

        const script = scriptDocument.script;
        const language = scriptDocument.language;
        const argumentsList = scriptDocument.argumentsList;

        let child;
        const userDirectory = path.join(__dirname,`temp/${scriptDocument.userId}` )
        if (language === 'cpp') {
            

            const filePath = path.join(userDirectory, 'temp.cpp');
            writeFileAsync(filePath, script).catch((error) => { logger.error(`Error writing temp cpp file: ${error}`)});

            const compile = spawn('g++', [filePath, '-o', path.join(userDirectory, 'temp')], { stdio: 'pipe' });
            socket.send(JSON.stringify({ data: 'Compiling...', info: 'COMPILATION STARTED' }));

            await new Promise((resolve, reject) => {
                compile.on('close', async (code) => {
                    if (code === 0) {
                        logger.debug('Successfully compiled');
                        socket.send(JSON.stringify({ data: 'Successfully compiled', info: 'COMPILE SUCCESS' }));
                        child = spawn(path.join(userDirectory, 'temp'), argumentsList, { stdio: 'pipe' });
                        await attachChildProcessListeners(child, socket);
                        deleteDirectoryAsync(userDirectory)

                        resolve();
                    } else {
                        logger.debug(`Compilation failed with code ${code}`);
                        socket.send(JSON.stringify({ data: `Compilation failed with code ${code}`, info: `COMPILE FAIL ${code}` }));
                        reject(`Compilation failed with code ${code}`);
                    }
                });

                compile.stdout.on('data', (data) => {
                    logger.debug(`Compile Output: ${data}`);
                    socket.send(JSON.stringify({ data: `${data}`, info: 'COMPILE STDOUT' }));
                });

                compile.stderr.on('data', (data) => {
                    logger.debug(`Compile Error: ${data}`);
                    socket.send(JSON.stringify({ data: `${data}`, info: 'COMPILE STDERR' }));
                });
            });

        } else if (language === 'node' || language === 'javascript') {
            const filePath = path.join(userDirectory, 'temp.js');
            writeFileAsync(filePath, script).catch((error) => { logger.error(`Error writing temp js file: ${error}`)});
            child = spawn('node', [filePath, ...argumentsList], { stdio: 'pipe' });
            socket.send(JSON.stringify({ data: 'Process started...', info: 'NODE PROCESS STARTED' }));
            await attachChildProcessListeners(child, socket);
            deleteDirectoryAsync(userDirectory)

        } else if (['python', 'python3'].includes(language)) {
            child = spawn('python', ['-c', script, ...argumentsList], { stdio: 'pipe' });
            socket.send(JSON.stringify({ data: 'Process started...', info: 'PYTHON PROCESS STARTED' }));
            await attachChildProcessListeners(child, socket);

        } else if (['bash', 'shell'].includes(language)) {
            const filePath = path.join(userDirectory, 'temp.sh');
            writeFileAsync(filePath, script).catch((error) => { logger.error(`Error writing temp bash file: ${error}`)});
            // await fs.chmod(filePath, '755');
            child = spawn('bash', [`src/controllers/executeScripts/temp/${scriptDocument.userId}/temp.sh`, ...argumentsList], { stdio: 'pipe' });
            socket.send(JSON.stringify({ data: 'Process started...', info: 'SHELL PROCESS STARTED' }));
            await attachChildProcessListeners(child, socket);
            deleteDirectoryAsync(path.join('src/controllers/executeScripts/temp', scriptDocument.userId))

        } else {
            logger.debug('Unsupported script language');
            socket.send(JSON.stringify({ data: 'Unsupported language', info: 'UNSUPPORTED LANGUAGE' }));
            return;
        }

    } catch (error) {
        logger.error(`EXECUTE ERROR ${error}`);
        socket.send(JSON.stringify({ data: 'INTERNAL SERVER ERROR', info: `EXECUTE ERROR ${error}` }));
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { runExecuteScript };
