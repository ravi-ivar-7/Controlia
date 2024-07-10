const { spawn } = require('child_process');
const { connectToSchemaLessDatabase } = require('../../databases/mongoDB');
const fs = require('fs');
const path = require('path');

function getDirToStoreFile() {
  return path.resolve(__dirname, '../../../temp');
}

function writeScriptToFile(scriptContent, fileName) {
  const dirToStoreFile = getDirToStoreFile();
  const absoluteFilePath = path.join(dirToStoreFile, fileName);
  fs.writeFileSync(absoluteFilePath, scriptContent);
  return absoluteFilePath;
}

const runExecuteScript = async (data, decodedToken, socket) => {
  let client;
  let child;

  try {
    const { client: dbClient, collection } = await connectToSchemaLessDatabase('controlia', 'scripts');
    client = dbClient;

    const scriptDocument = await collection.findOne({ userId: decodedToken.userId, scriptId: data.scriptId });

    if (!scriptDocument) {
      socket.send(JSON.stringify({ error: 'Script not found' }));
      return;
    }

    const script = scriptDocument.script;
    const language = scriptDocument.language;
    const argumentsList = scriptDocument.argumentsList;

    let filePath;
    let dirToStoreFile = getDirToStoreFile();

    if (language === 'cpp') {
      filePath = writeScriptToFile(script, 'tempcpp.cpp');

      const compile = spawn('g++', [filePath, '-o', path.join(dirToStoreFile, 'output')], { stdio: 'pipe' });
      socket.send(JSON.stringify({ data: 'Compiling...' }));

      compile.on('close', (code) => {
        if (code === 0) {
          socket.send(JSON.stringify({ data: 'Successfully compiled' }));
          const child = spawn(path.join(dirToStoreFile, 'output'), argumentsList, { stdio: 'pipe' });
          attachChildProcessListeners(child, socket);
        } else {
          socket.send(JSON.stringify({ data: `Compilation failed with code ${code}` }));
        }
      });

      compile.stdout.on('data', (data) => {
        console.log(`Compile Output: ${data}`);
        socket.send(JSON.stringify({ data: `STDOUT: ${data}` }));
      });

      compile.stderr.on('data', (data) => {
        console.error(`Compile Error: ${data}`);
        socket.send(JSON.stringify({ data: `STDERR: ${data}` }));
      });

    } else if (language === 'node' || language === 'javascript') {
      filePath = writeScriptToFile(script, 'tempjs.js');
      child = spawn('node', [filePath, ...argumentsList], { stdio: 'pipe' });
      socket.send(JSON.stringify({ data: 'Process started...' }));
      attachChildProcessListeners(child, socket);
    } else if (['python', 'python3'].includes(language)) {
      const command = 'python';
      child = spawn(command, ['-c', script, ...argumentsList], { stdio: 'pipe' });
      socket.send(JSON.stringify({ data: 'Process started...' }));
      attachChildProcessListeners(child, socket);
    }

    else if (['bash', 'shell'].includes(language)) {
      const filePath = writeScriptToFile(script, 'bashtemp.sh');

      fs.chmodSync(filePath, '755');
      const dirToStoreFile = getDirToStoreFile();

      const child = spawn('bash', ['temp/bashtemp.sh', ...argumentsList], { stdio: 'pipe' }); // requres relative path to project
      socket.send(JSON.stringify({ data: 'Process started...' }));
      attachChildProcessListeners(child, socket);
    }

    else {
      socket.send(JSON.stringify({ data: 'Unsupported script language' }));
    }

    socket.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString('utf8'));
        console.log('Message from client:', parsedMessage);
        if (child) {
          console.log(`Sending input to child process: ${parsedMessage.data}`);
          child.stdin.write(parsedMessage.data + '\n');
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

  } catch (error) {
    console.error('ERROR IN RUN EXECUTION SCRIPT: ', error);
    socket.send(JSON.stringify({ error: 'INTERNAL SERVER ERROR' }));
  } finally {
    if (client) {
      await client.close();
    }
  }
};

const attachChildProcessListeners = (child, socket) => {
  child.stdout.on('data', (data) => {
    socket.send(JSON.stringify({ data: `STDOUT: ${data}` }));
  });

  child.stderr.on('data', (data) => {
    socket.send(JSON.stringify({ data: `STDERR: ${data}` }));
  });

  child.on('close', (code) => {
    socket.send(JSON.stringify({ data: `CHILD PROCESS CLOSED WITH CODE: ${code}` }));
  });

  child.on('error', (err) => {
    console.error(`Child process error: ${err}`);
    socket.send(JSON.stringify({ data: `CHILD PROCESS ERROR: ${err}` }));
  });
};

module.exports = { runExecuteScript };
