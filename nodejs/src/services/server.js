const os = require('os');
const { spawn } = require('child_process');

const checkServer =  async (req, res) => {
    const uptime = process.uptime(); // Server uptime in seconds
    const hostname = os.hostname(); 
    const loadavg = os.loadavg();    // Load average over 1, 5, and 15 minutes
    const memoryUsage = process.memoryUsage();

    res.status(200).json({
        status: "ok",
        uptime: `${Math.floor(uptime / 60)} minutes`,
        hostname: hostname,
        loadavg: loadavg,
        memoryUsage: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
            external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
        },
        timestamp: new Date().toISOString()
    });
}
// index.js


const startWorkerServer = async (req, res) => {
    try {
        const workerProcess = spawn('node', ['worker.js'], {
            detached: true, // Allows the child process to run independently of the parent
            stdio: 'ignore', // Ignore input/output streams of the child process
        });

        // Handle errors if the spawn fails
        workerProcess.on('error', (err) => {
            console.error('Failed to start worker process:', err);
            res.status(500).send('Failed to start worker process');
        });

        // Notify success to the client
        res.status(200).send('Worker process started successfully.');

        // Optionally, you can also unref the worker process to allow the parent process to exit independently
        workerProcess.unref();
    } catch (error) {
        console.error('Error starting worker process:', error);
        res.status(500).send('Error starting worker process');
    }
};



module.exports = {checkServer, startWorkerServer}
