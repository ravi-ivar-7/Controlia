require('dotenv').config({ path: '../../../config/env/.env' });
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const { MongoClient } = require('mongodb');
const { sendMail } = require('../../utils/sendMail');

const attachChildProcessListeners = (child) => {
    return new Promise((resolve, reject) => {
        let outputData = [];

        child.stdout.on('data', (data) => {
            console.log(`STDOUT: ${data}`);
            outputData.push(`${new Date().toISOString()}, STDOUT: ${data}`);
        });

        child.stderr.on('data', (data) => {
            console.log(`STDERR: ${data}`);
            outputData.push(`${new Date().toISOString()}, STDERR: ${data}`);
        });

        child.on('close', (code) => {
            console.log(`CHILD PROCESS CLOSED WITH CODE: ${code}`);
            outputData.push(`${new Date().toISOString()}, CHILD PROCESS CLOSED WITH CODE: ${code}`);
            resolve(outputData);
        });

        child.on('error', (err) => {
            console.error(`Child process error: ${err}`);
            outputData.push(`${new Date().toISOString()}, Child process error: ${err}`);
            reject(outputData);
        });
    });
};

const runScheduleScript = async (scriptInfo) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    let outputData = [];
    let scheduleJobName;

    try {
        await client.connect();

        const db = client.db("controlia");
        const jobCollection = db.collection('schedules');
        const scriptCollection = db.collection('scripts');

        const scriptDocument = await scriptCollection.findOne({ userId: scriptInfo.userId, scriptId: scriptInfo.scriptId });

        if (!scriptDocument) {
            console.log('Script not found');
            return;
        }

        scheduleJobName = scriptDocument.scheduleJobName;

        if (scriptDocument.scheduleType === 'fixed') {
            await jobCollection.findOneAndDelete({ userId: scriptDocument.userId, scriptId: scriptDocument.scriptId, scheduleJobName: scriptDocument.scheduleJobName });

            const scheduleUpdateFields = {
                $set: {
                    schedule: '',
                    scheduleType: '',
                    scheduleJobName: '',
                    date: new Date(),
                }
            };

            await scriptCollection.findOneAndUpdate(
                { userId: scriptInfo.userId, scriptId: scriptInfo.scriptId },
                scheduleUpdateFields,
                { returnDocument: 'after', upsert: true }
            );
            console.log('Deleted from job collection and scripts info');
        }

        const script = scriptDocument.script;
        const language = scriptDocument.language;
        const argumentsList = scriptDocument.argumentsList;

        console.log(`Executing schedule job ${scriptInfo.scheduleJobName}`);
        outputData.push(`${new Date().toISOString()}, Executing schedule job ${scriptInfo.scheduleJobName}`);

        let child;
        if (language === 'cpp') {
            const filePath = path.join(__dirname, 'tempcpp.cpp');
            await fs.writeFile(filePath, script);

            const compile = spawn('g++', [filePath, '-o', path.join(__dirname, 'output')], { stdio: 'pipe' });

            console.log('Compiling...');
            outputData.push(`${new Date().toISOString()}, Compiling...`);
            
            await new Promise((resolve, reject) => {
                compile.on('close', async (code) => {
                    if (code === 0) {
                        console.log('Successfully compiled');
                        outputData.push(`${new Date().toISOString()}, Successfully compiled...`);
                        child = spawn(path.join(__dirname, 'output'), argumentsList, { stdio: 'pipe' });
                        resolve();
                    } else {
                        console.log(`Compilation failed with code ${code}`);
                        outputData.push(`${new Date().toISOString()}, Compilation failed with code ${code}`);
                        reject();
                    }
                });

                compile.stdout.on('data', (data) => {
                    console.log(`Compile Output: ${data}`);
                    outputData.push(`${new Date().toISOString()}, Compile Output: ${data}`);
                });

                compile.stderr.on('data', (data) => {
                    console.error(`Compile Error: ${data}`);
                    outputData.push(`${new Date().toISOString()}, Compile Error: ${data}`);
                });
            });

        } else if (language === 'node' || language === 'javascript') {
            const filePath = path.join(__dirname, 'tempjs.js');
            await fs.writeFile(filePath, script);
            child = spawn('node', [filePath, ...argumentsList], { stdio: 'pipe' });
            console.log('Process started...');
            outputData.push(`${new Date().toISOString()}, Process started...`);
        } else if (['python', 'python3'].includes(language)) {
            child = spawn('python', ['-c', script, ...argumentsList], { stdio: 'pipe' });
            console.log('Process started...');
            outputData.push(`${new Date().toISOString()}, Process started...`);
        } else if (['bash', 'shell'].includes(language)) {
            const filePath = path.join(__dirname, 'bashtemp.sh');
            await fs.writeFile(filePath, script);
            await fs.chmod(filePath, '755');
            child = spawn('bash', ['temp/bashtemp.sh', ...argumentsList], { stdio: 'pipe' });
            console.log('Process started...');
            outputData.push(`${new Date().toISOString()}, Process started...`);
        } else {
            console.log('Unsupported script language');
            outputData.push(`${new Date().toISOString()}, Unsupported script language`);
            return;
        }

        const processOutputData = await attachChildProcessListeners(child);
        outputData = outputData.concat(processOutputData);

    } catch (error) {
        console.error('ERROR IN RUN EXECUTION SCRIPT: ', error);
        outputData.push(`${new Date().toISOString()}, ERROR IN RUN EXECUTION SCRIPT: ${error}`);
    } finally {
        if (client) {
            await client.close();

            // Convert outputData array to CSV string
            const csvContent = outputData.join('\n');
            const csvBuffer = Buffer.from(`Date-time,Output\n${csvContent}`, 'utf-8');

            const mailOptions = {
                from: 'ravi404606@gmail.com',
                to: 'xotivar5@gmail.com',
                subject: 'Job executed',
                text: `Your job name ${scheduleJobName} has been executed with the following output`,
                attachments: [
                    {
                        filename: 'output.csv',
                        content: csvBuffer,
                    }
                ]
            };

            sendMail(mailOptions)
                .then(() => {
                    console.log('Email sent successfully');
                })
                .catch((err) => {
                    console.error('Error sending email:', err);
                });
        }
    }
};

module.exports = { runScheduleScript };

