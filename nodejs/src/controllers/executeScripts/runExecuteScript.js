require('dotenv').config({ path: '../../../.env' });
const { spawn } = require('child_process');
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

const attachChildProcessListeners = (child, socket) => {
    return new Promise((resolve, reject) => {
        child.stdout.on('data', (data) => {
            console.log(`STDOUT: ${data}`);
            socket.send(JSON.stringify({ data: `${data}`, message: 'CHILD STDOUT' }));
        });

        child.stderr.on('data', (data) => {
            console.error(`STDERR: ${data}`);
            socket.send(JSON.stringify({ data: `${data}`, message: 'CHILD STDERR' }));
        });

        child.on('close', (code) => {
            console.log(`CHILD PROCESS CLOSED WITH CODE: ${code}`);
            socket.send(JSON.stringify({ data: `EXIT CODE: ${code}`, message: `CHILD CLOSE ${code}` }));
            resolve();
        });

        child.on('error', (err) => {
            console.error(`Child process error: ${err}`);
            socket.send(JSON.stringify({ data: `ERROR: ${err}`, message: `CHILD ERROR ${err}` }));
            reject(err);
        });
    });
};

const runExecuteScript = async (scriptInfo, decodedToken, socket) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    const dirToStoreFile = path.join(__dirname, '../../../temp')
    try {
        await client.connect();
        const db = client.db("controlia");
        const scriptCollection = db.collection('executeScripts');

        const scriptDocument = await scriptCollection.findOne({ userId: decodedToken.userId, scriptId: scriptInfo.scriptId });
        if (!scriptDocument) {
            console.log('Script not found');
            socket.send(JSON.stringify({ data: 'Script not found', message: 'SCRIPT NOT FOUND' }));
            return;
        }

        const script = scriptDocument.script;
        const language = scriptDocument.language;
        const argumentsList = scriptDocument.argumentsList;

        let child;

        if (language === 'cpp') {
            const filePath = path.join(dirToStoreFile, 'tempcpp.cpp');
            await fs.writeFile(filePath, script);

            const compile = spawn('g++', [filePath, '-o', path.join(dirToStoreFile, 'output')], { stdio: 'pipe' });
            socket.send(JSON.stringify({ data: 'Compiling...', message: 'COMPILATION STARTED' }));

            await new Promise((resolve, reject) => {
                compile.on('close', async (code) => {
                    if (code === 0) {
                        console.log('Successfully compiled');
                        socket.send(JSON.stringify({ data: 'Successfully compiled', message: 'COMPILE SUCCESS' }));
                        child = spawn(path.join(dirToStoreFile, 'output'), argumentsList, { stdio: 'pipe' });
                        await attachChildProcessListeners(child, socket);
                        resolve();
                    } else {
                        console.log(`Compilation failed with code ${code}`);
                        socket.send(JSON.stringify({ data: `Compilation failed with code ${code}`, message: `COMPILE FAIL ${code}` }));
                        reject(`Compilation failed with code ${code}`);
                    }
                });

                compile.stdout.on('data', (data) => {
                    console.log(`Compile Output: ${data}`);
                    socket.send(JSON.stringify({ data: `${data}`, message: 'COMPILE STDOUT' }));
                });

                compile.stderr.on('data', (data) => {
                    console.error(`Compile Error: ${data}`);
                    socket.send(JSON.stringify({ data: `${data}`, message: 'COMPILE STDERR' }));
                });
            });

        } else if (language === 'node' || language === 'javascript') {
            const filePath = path.join(dirToStoreFile, 'tempjs.js');
            await fs.writeFile(filePath, script);
            child = spawn('node', [filePath, ...argumentsList], { stdio: 'pipe' });
            socket.send(JSON.stringify({ data: 'Process started...', message: 'NODE PROCESS STARTED' }));
            await attachChildProcessListeners(child, socket);

        } else if (['python', 'python3'].includes(language)) {
            child = spawn('python', ['-c', script, ...argumentsList], { stdio: 'pipe' });
            socket.send(JSON.stringify({ data: 'Process started...', message: 'PYTHON PROCESS STARTED' }));
            await attachChildProcessListeners(child, socket);

        } else if (['bash', 'shell'].includes(language)) {
            const filePath = path.join(dirToStoreFile, 'bashtemp.sh');
            await fs.writeFile(filePath, script);
            await fs.chmod(filePath, '755');
            child = spawn('bash', ['temp/bashtemp.sh', ...argumentsList], { stdio: 'pipe' });
            socket.send(JSON.stringify({ data: 'Process started...', message: 'SHELL PROCESS STARTED' }));
            await attachChildProcessListeners(child, socket);

        } else {
            console.log('Unsupported script language');
            socket.send(JSON.stringify({ data: 'Unsupported language', message: 'UNSUPPORTED LANGUAGE' }));
            return;
        }

    } catch (error) {
        console.error('ERROR IN RUN EXECUTION SCRIPT: ', error);
        socket.send(JSON.stringify({ data: 'INTERNAL SERVER ERROR', message: `EXECUTE ERROR ${error}`}));
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = { runExecuteScript };
