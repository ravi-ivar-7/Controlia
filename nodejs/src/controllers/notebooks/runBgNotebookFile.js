require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });
const logger = require('../../services/logs/winstonLogger');
const { resetNotebookSchedule } = require('./resetNotebookSchedule')
const { saveFileToContainer } = require('../../services/docker/manageVolumeFiles')
const { addToMailQueue } = require('../../services/mail/manageMail');

const runBgNotebookFile = async (job) => {
    const { userId, email, notebookName } = job.data;
    const client = new MongoClient(process.env.MONGODB_URL);
    let output = [];
    try {
        await client.connect();
        const db = client.db("controlia");
        const usersCollection = db.collection('users');
        const notebooksCollection = db.collection('notebooks');

        const user = await usersCollection.findOne({ userId: userId });
        const notebook = await notebooksCollection.findOne({ userId: user.userId, notebookName: notebookName });

        if (!user || !notebook) {
            output.push('User or notebook not found.');
            return;
        }

        const NOTEBOOK_DIR = `/${user.userId}/notebooks`;
        const container = docker.getContainer(user.containerId);

        let exec = await container.exec({
            Cmd: ['jupyter', 'nbconvert', '--to', 'notebook', '--execute', `${NOTEBOOK_DIR}/${notebook.notebookName}`, '--output', `${NOTEBOOK_DIR}/${notebook.scheduleOutputFileName}`],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });

        let stream = await exec.start({ hijack: true, stdin: true });

        stream.on('data', (data) => {
            output.push(data.toString().replace(/[^\x20-\x7E]/g, '').trim());
        });

        stream.on('error', (error) => {
            console.log('error', error)
            const errorMessage = error.toString().replace(/[^\x20-\x7E]/g, '').trim();
            output.push(errorMessage);
        });

        await new Promise((resolve) => {
            stream.on('end', resolve);
        });

        output.push(`Job done!`);
        output.push(`You can view resultant notebook as: Go to Notebooks->Add Notebooks -> Start Notebook Server -> Open Notebook server and select your scheduleOutputFileName.ipynb`)
        if (notebook.scheduleOptions.includes('sendOverMail')) {
            const jsonData = JSON.stringify(output, null, 2);

            let mailOptions = {
                from: process.env.NODEJS_FROM_EMAIL,
                subject: `${notebook.scheduleName} completed.`,
                to: email,
                text: ` ${notebook.scheduleName} completed. \nInfo: You can view resultant notebook as: Go to Notebooks->Add Notebooks -> Start Notebook Server -> Open Notebook server and select your scheduleOutputFileName.ipynb`,
                attachments: [
                    {
                        filename: 'output.json',
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

        if (notebook.scheduleOptions.includes('saveToSystem')) {
            const USER_DIR = `/${user.userId}/notebooks`;

            const fileContent = output.join('\n');
            await saveFileToContainer(user.containerId, `${USER_DIR}`, notebook.scheduleOutputFileName, fileContent);
        }

        if (notebook.scheduleType === 'fixed') {
            await resetNotebookSchedule(user, notebook);
        }
        return;

    } catch (error) {
        logger.error(`ERROR IN RUNNING BG NOTEBOOK: ${error}`);
        output.push('An error occurred during notebook execution.');
        output.push(error.toString());
    } finally {
        await client.close();
    }
};

module.exports = {
    runBgNotebookFile
};
