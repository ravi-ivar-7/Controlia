const os = require('os');
const { spawn } = require('child_process');
const logger = require('./winstonLogger');

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
const startWorkerServer = async (req, res) => {
    try {
        const workerProcess = spawn('node', ['worker.js'], {
            // detached: true, // Allows the child process to run independently of the parent
            // stdio: 'ignore', // Ignore input/output streams of the child process
        });

        workerProcess.on('error', (err) => {
            logger.error('Failed to start worker process:', err);
            res.status(500).send('Error starting worker process');
        });

        workerProcess.stdout.on('data', (data) => {
            logger.debug(`STDOUT: ${data}`);
        });

        workerProcess.stderr.on('data', (data) => {
            logger.debug(`STDERR: ${data}`);
        });

        workerProcess.on('close', (code) => {
            logger.debug(`workerProcess PROCESS CLOSED WITH CODE: ${code}`);
        });

        workerProcess.unref();

        // If you reach here, it means the worker process was started successfully
        res.status(200).send('Worker process started successfully');
    } catch (error) {
        logger.error('Error starting worker process:', error);
        res.status(500).send('Error starting worker process');
    }
};



module.exports = {checkServer, startWorkerServer}
