const { spawn } = require('child_process');
const { connectToSchemaLessDatabase } = require('../../databases/mongoDB');


const runScheduleScript = async (scriptInfo) => {

    const { client: dbClient, collection } = await connectToSchemaLessDatabase('controlia', 'executionscript');
    client = dbClient;

    const scriptDocument = await collection.findOne({ userId: decodedToken.userId, scriptId: data.scriptId })

    const script = scriptDocument.script
    const language = scriptDocument.language

    let child;

    if (language === 'c++') {
        const compile = spawn('g++', [script, '-o', 'output'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        compile.on('close', (code) => {
            if (code == 0) {
                child = spawn('./output', [], {
                    stdio: ['pipe', 'pipe', 'pipe']
                });
                // Handle stdout from the child process
                child.stdout.on('data', (data) => {
                    socket.send(JSON.stringify({ data: `STDOUT: ${data.toString()}` }));
                });

                // Handle stderr from the child process
                child.stderr.on('data', (data) => {
                    socket.send(JSON.stringify({ data: `STDERR: ${data.toString()}` }));
                });

                // Handle the close event of the child process
                child.on('close' || 'exit', (code) => {
                    socket.send(JSON.stringify({ data: `CHILD PROCESS CLOSED WITH CODE: ${code}` }));
                });

                // Handle errors in the child process
                child.on('error', (err) => {
                    console.error(`Child process error: ${err}`);
                    socket.send(JSON.stringify({ data: `CHILD PROCESS ERROR: ${err.message}` }));
                });


                socket.on('message', async (message) => {
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
            }
            else {
                socket.send(JSON.stringify({ data: `Compilation failed with code ${code}` }))
            }

        })

        compile.stdout.on('data', (data) => {
            console.log(`Compile Output: ${data}`);
        });

        compile.stderr.on('data', (data) => {
            console.error(`Compile Error: ${data}`);
        });
    }
    else if (language === 'bash') {
        child = spawn(language, ['-c', script], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
    } else if (language === 'python' || language === 'python3' || language === 'node') {
        child = spawn(language, [script], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
    }


    // Handle stdout from the child process
    child.stdout.on('data', (data) => {
        socket.send(JSON.stringify({ data: `STDOUT: ${data.toString()}` }));
    });

    // Handle stderr from the child process
    child.stderr.on('data', (data) => {
        socket.send(JSON.stringify({ data: `STDERR: ${data.toString()}` }));
    });

    // Handle the close event of the child process
    child.on('close' || 'exit', (code) => {
        socket.send(JSON.stringify({ data: `CHILD PROCESS CLOSED WITH CODE: ${code}` }));
    });

    // Handle errors in the child process
    child.on('error', (err) => {
        console.error(`Child process error: ${err}`);
        socket.send(JSON.stringify({ data: `CHILD PROCESS ERROR: ${err.message}` }));
    });


    socket.on('message', async (message) => {
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



};

module.exports = { runScheduleScript };
