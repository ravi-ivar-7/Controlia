const { spawn } = require('child_process');

const cppServer = async (data, socket) => {

    const commands = `
        echo "Script started..."
        echo "Enter name:"
    `;

    const child = spawn('bash', ['-c', commands], {
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
};

module.exports = { cppServer };
