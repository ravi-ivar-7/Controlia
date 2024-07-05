const os = require('os');

const serverCheck =  async (req, res) => {
    const uptime = process.uptime(); // Server uptime in seconds
    const hostname = os.hostname(); 
    const loadavg = os.loadavg();    // Load average over 1, 5, and 15 minutes
    const memoryUsage = process.memoryUsage();

    res.status(200).json({
        message: "pong",
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

module.exports = {serverCheck}
