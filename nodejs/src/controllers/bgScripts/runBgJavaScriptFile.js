require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });
const logger = require('../../services/logs/winstonLogger');
const { resetScriptSchedule } = require('./deleteScriptSchedule')
const { saveFileToContainer } = require('../../services/docker/manageVolumeFiles')
const { addToMailQueue } = require('../../services/mail/manageMail');

const runBgJavaScriptFile = async (job) => {
    const { userId, email, scriptName, scriptId } = job.data;
    const client = new MongoClient(process.env.MONGODB_URL);
    let output = [];
    try {
       
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const scriptsCollection = db.collection('scripts');

        const user = await usersCollection.findOne({ userId: userId });
        const script = await scriptsCollection.findOne({ userId: user.userId, scriptId: scriptId });

        if (!user || !script) {
            output.push('User or script not found.')
            return;
        }

        const SCRIPT_DIR = `/${user.userId}/scripts`;
        const args = script.argumentList || [];

        const container = docker.getContainer(user.containerId);

        let exec = await container.exec({
            Cmd: ['node', `${SCRIPT_DIR}/${script.scriptName}`,...args],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });

        let stream = await exec.start({ hijack: true, stdin: true });

        stream.on('data', (data) => {
            output.push(data.toString().replace(/[^\x20-\x7E]/g, '').trim()) 
      
        });

        stream.on('error', (error) => {
            const errorMessage = error.toString().replace(/[^\x20-\x7E]/g, '').trim();
           output.push(errorMessage)
        });

        await new Promise((resolve) => {
            stream.on('end', resolve);
        });

        output.push(`Job done!`)

        if (script.scheduleOptions.includes('sendOverMail')) {
            // Convert array to JSON
            const jsonData = JSON.stringify(output, null, 2); // Pretty-print with 2 spaces for readability

            let mailOptions = {
                from: process.env.NODEJS_FROM_EMAIL,
                subject: `${script.scheduleName} completed.`,
                to: email,
                text: ` ${script.scheduleName} completed.`,
                attachments: [
                    {
                        filename: script.scheduleOutputFileName,
                        content: jsonData,
                    }
                ]
            };
            addToMailQueue(mailOptions)
                .then(() => {
                    logger.info('New schedule mail alert added.');
                })
                .catch((error) => {
                    logger.error(`Failed to add schedule mail alert. ${error}`);
                });
        }

        if (script.scheduleOptions.includes('saveToSystem')) {
            const USER_DIR = `/${user.userId}/scripts`

            const fileContent = output.join('\n');
            await saveFileToContainer(user.containerId, `${USER_DIR}`, script.scheduleOutputFileName, fileContent)
        }

        if (script.scheduleType === 'fixed') {
            await resetScriptSchedule(user, script);
        }
        return;

    }catch (error) {
        logger.error(`ERROR IN RUNNING BG SCRIPT: ${error}`);
        output.push('An error occurred during script execution.')
        output.push( error.toString())
    } finally {
        await client.close();
    }
};

module.exports = {
    runBgJavaScriptFile
};

