require('dotenv').config({ path: '../../../.env' });
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const { MongoClient } = require('mongodb');
const { addToMailQueue } = require('../../services/manageMail');
const logger = require('../../services/winstonLogger');

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
        throw error; // Make sure to propagate the error
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

const attachChildProcessListeners = (child) => {
    return new Promise((resolve, reject) => {
        let outputData = [];

        child.stdout.on('data', (data) => {
            logger.debug(`STDOUT: ${data}`);
            outputData.push(`${new Date().toISOString()},${data}`);
        });

        child.stderr.on('data', (data) => {
            logger.debug(`STDERR: ${data}`);
            outputData.push(`${new Date().toISOString()}, ${data}`);
        });

        child.on('close', (code) => {
            logger.debug(`CHILD PROCESS CLOSED WITH CODE: ${code}`);
            outputData.push(`${new Date().toISOString()}, PROCESS CLOSED WITH CODE: ${code}`);
            resolve(outputData);
        });

        child.on('error', (err) => {
            logger.debug(`Child process error: ${err}`);
            outputData.push(`${new Date().toISOString()},PROCESS ERROR: ${err}`);
            reject(outputData);
        });
    });
};

const runScheduleScript = async (job) => {
    const { scriptInfo } = job.data;
    const client = new MongoClient(process.env.MONGODB_URL);
    const dirToStoreFile = path.join(__dirname, '../../../temp')
    let outputData = [];
    processChildOutput =[]
    let scheduleId;
    let toMail;
    try {
        await client.connect();

        const db = client.db("controlia");
        const scheduleCollection = db.collection('scheduleScripts');


        const scriptDocument = await scheduleCollection.findOne({ userId: scriptInfo.userId, scriptId: scriptInfo.scriptId });

        if (!scriptDocument) {
            logger.error(`Schedule script not found: ${scriptInfo}`);
            outputData.push(`Schedule script ${scriptInfo} not found.`)
            return;
        }

        scheduleId = scriptDocument.scheduleId;
        toMail = scriptDocument.email;
        const userDirectory = path.join(__dirname,`temp/${scriptDocument.userId}` )

        if (scriptDocument.scheduleType === 'fixed') {
            await scheduleCollection.findOneAndDelete({ userId: scriptDocument.userId, scriptId: scriptDocument.scriptId });
            const scheduleUpdateFields = {
                $set: {
                    scheduleId: '',
                    date: new Date(),
                }
            };

            const scriptCollection = db.collection('executeScripts');
            await scriptCollection.findOneAndUpdate(
                { userId: scriptDocument.userId, scriptId: scriptDocument.scriptId },
                scheduleUpdateFields,
                { returnDocument: 'after', upsert: true }
            );
            logger.debug('Deleted from job collection and scripts info');
        }

        const script = scriptDocument.script;
        const language = scriptDocument.language;
        const argumentsList = scriptDocument.argumentsList;

        logger.debug(`Executing schedule job ${scriptDocument.scheduleId}`);
        outputData.push(`${new Date().toISOString()}, Executing schedule job ${scriptDocument.scheduleId}`);

        let child;
        if (language === 'cpp') {
             const filePath = path.join(userDirectory, 'temp.cpp');
            await writeFileAsync(filePath, script).catch((error) => { logger.error(`Error writing temp cpp file: ${error}`)});

            const compile = spawn('g++', [filePath, '-o', path.join(userDirectory, 'temp')], { stdio: 'pipe' });

            logger.debug('Compiling...');
            outputData.push(`${new Date().toISOString()}, Compiling...`);

            await new Promise((resolve, reject) => {
                compile.on('close', async (code) => {
                    if (code === 0) {
                        logger.debug('Successfully compiled');
                        outputData.push(`${new Date().toISOString()}, Successfully compiled...`);
                        child = spawn(path.join(dirToStoreFile, 'temp'), argumentsList, { stdio: 'pipe' });
                        processChildOutput = await attachChildProcessListeners(child);
                        deleteDirectoryAsync(userDirectory)

                        resolve();
                    } else {
                        logger.error(`Compilation failed with code ${code}`);
                        outputData.push(`${new Date().toISOString()}, Compilation failed with code ${code}`);
                        reject();
                    }
                });

                compile.stdout.on('data', (data) => {
                    logger.debug(`Compile Output: ${data}`);
                    outputData.push(`${new Date().toISOString()}, Compile Output: ${data}`);
                });

                compile.stderr.on('data', (data) => {
                    logger.error(`Compile Error: ${data}`);
                    outputData.push(`${new Date().toISOString()}, Compile Error: ${data}`);
                });
            });

        } else if (language === 'node' || language === 'javascript') {
             const filePath = path.join(userDirectory, 'temp.js');
            writeFileAsync(filePath, script).catch((error) => { logger.error(`Error writing temp js file: ${error}`)});
            child = spawn('node', [filePath, ...argumentsList], { stdio: 'pipe' });
            logger.debug('Process started...');
            outputData.push(`${new Date().toISOString()}, Process started...`);
            processChildOutput = await attachChildProcessListeners(child);
            deleteDirectoryAsync(userDirectory)

        } else if (['python', 'python3'].includes(language)) {
            child = spawn('python', ['-c', script, ...argumentsList], { stdio: 'pipe' });
            logger.debug('Process started...');
            outputData.push(`${new Date().toISOString()}, Process started...`);
            processChildOutput = await attachChildProcessListeners(child);
        } else if (['bash', 'shell'].includes(language)) {
            const filePath = path.join(userDirectory, 'temp.sh');
            writeFileAsync(filePath, script).catch((error) => { logger.error(`Error writing temp bash file: ${error}`)});
            // await fs.chmod(filePath, '755');
            child = spawn('bash', [`src/controllers/executeScripts/temp/${scriptDocument.userId}/temp.sh`, ...argumentsList], { stdio: 'pipe' });
            logger.debug('Process started...');
            outputData.push(`${new Date().toISOString()}, Process started...`);
            processChildOutput = await attachChildProcessListeners(child);
            deleteDirectoryAsync(path.join('src/controllers/executeScripts/temp', scriptDocument.userId))
        } else {
            logger.debug('Unsupported script language');
            outputData.push(`${new Date().toISOString()}, Unsupported script language`);
            return;
        }

        outputData = outputData.concat(processChildOutput);

    } catch (error) {
        logger.error(`ERROR IN RUNNING EXECUTION SCRIPT: ${error}`);
        outputData.push(`${new Date().toISOString()}, ERROR IN RUNNING EXECUTION SCRIPT: ${error}`);
    } finally {
        if (client) {
            await client.close();
            try {


                // Convert array to JSON
                const jsonData = JSON.stringify(outputData, null, 2); // Pretty-print with 2 spaces for readability

                // Convert JSON string to Buffer
                const jsonBuffer = Buffer.from(jsonData, 'utf-8');

                // Construct email message
                const mailOptions = {
                    from: process.env.NODEJS_FROM_EMAIL,
                    to: toMail,
                    subject: 'Job executed',
                    text: `Your job ${scheduleId} has been executed with the following output`,
                    attachments: [
                        {
                            filename: 'output.json',
                            content: jsonData,
                        }
                    ]
                };

                await addToMailQueue(mailOptions);

                logger.info('Mail job for completion schedule added to queue successfully.');
            } catch (error) {
                logger.error('Error adding schedule completion mail job to queue:', error);
            }
        }
    }
};

module.exports = { runScheduleScript };

