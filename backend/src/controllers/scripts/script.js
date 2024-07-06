const { spawn } = require('child_process');


const executeScript = (req, res) => {

    const scriptPath = 'script.sh';

    // Spawn a new bash process and execute the script
    const child = spawn('bash', [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'] // Use pipes for stdin, stdout, stderr
    });

    // Handle stdout from the child process
    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    // Handle stderr from the child process
    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    // Handle the close event of the child process
    child.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

    // Handle errors in the child process
    child.on('error', (err) => {
        console.error(`child process error: ${err}`);
    });

    // Process stdin (terminal input) to pass to child process
    process.stdin.on('data', (data) => {
        child.stdin.write(data); // Write terminal input to child process stdin
    });

    // End input stream when user closes terminal input (Ctrl+D)
    process.stdin.on('end', () => {
        child.stdin.end(); // Close stdin to indicate end of input
    });

    // Handling Child Process Exit:

    child.on('exit', (code, signal) => {
        console.log(`child process exited with code ${code}`);
        process.exit(code); // Exit the Node.js script with the same exit code as the child process
    });

}
