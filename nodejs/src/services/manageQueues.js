const { scheduleScriptQueue } = require('../controllers/scheduleScripts/addEditScheduleScript');
const {mailQueue} = require('./manageMail')

const queueMap = {
    scheduleScriptQueue,
    mailQueue
};

const getQueueJobs = async (req, res) => {
    try {
        const { queuename } = req.params;
        const queue = queueMap[queuename];
        if (!queue) {
            return res.status(404).json({ warn: `Queue ${queuename} not found` });
        }

        const jobs = await queue.getJobs(['waiting', 'active', 'delayed']);
        res.status(200).json({ jobs });
    } catch (error) {
        res.status(500).json({ warn: `Failed to get jobs for ${queuename}`, error: error.message });
    }
};

const deleteJob = async (req, res) => {
    const { queuename, scheduleId } = req.params;
    try {
        const queue = queueMap[queuename];
        if (!queue) {
            return res.status(404).json({ warn: `Queue ${queuename} not found` });
        }

        const jobs = await queue.getJobs(['waiting', 'active', 'delayed', 'completed', 'failed']);
        const job = jobs.find(job => job.data.scheduleId === scheduleId);

        if (job) {
            await job.remove();
            res.status(200).json({ info: `Job with scheduleId ${scheduleId} removed successfully` });
        } else {
            res.status(404).json({ warn: `Job with scheduleId ${scheduleId} not found` });
        }
    } catch (error) {
        res.status(500).json({ warn: `Error deleting job`, error: error.message });
    }
};

const pauseQueue = async (req, res) => {
    try {
        const { queuename } = req.params;
        const queue = queueMap[queuename];
        if (!queue) {
            return res.status(404).json({ warn: `Queue ${queuename} not found` });
        }

        await queue.pause();
        res.status(200).json({ info: `Queue ${queuename} paused successfully` });
    } catch (error) {
        res.status(500).json({ warn: `Failed to pause ${queuename}`, error: error.message });
    }
};

const resumeQueue = async (req, res) => {
    try {
        const { queuename } = req.params;
        const queue = queueMap[queuename];
        if (!queue) {
            return res.status(404).json({ warn: `Queue ${queuename} not found` });
        }

        await queue.resume();
        res.status(200).json({ info: `Queue ${queuename} resumed successfully` });
    } catch (error) {
        res.status(500).json({ warn: `Failed to resume ${queuename}`, error: error.message });
    }
};

const emptyQueue = async (req, res) => {
    try {
        const { queuename } = req.params;
        const queue = queueMap[queuename];
        if (!queue) {
            return res.status(404).json({ warn: `Queue ${queuename} not found` });
        }

        await queue.obliterate();
        res.status(200).json({ info: `Queue ${queuename} emptied successfully` });
    } catch (error) {
        res.status(500).json({ warn: `Failed to empty ${queuename}`, error: error.message });
    }
};

const deleteQueue = async (req, res) => {
    const queuename = req.params.queuename
    const queue = queueMap[queuename];

    if (!queue) {
        console.error(`Queue ${queuename} not found`);
        return;
    }

    try {
        await queue.pause(); 

        const jobs = await queue.getJobs(['waiting', 'active', 'delayed', 'completed', 'failed']);
        await Promise.all(jobs.map(job => job.remove())); 

        // await queue.close(); 
        // queueMap[queuename] = null;

        console.log(`Queue ${queuename} deleted successfully`);
        res.status(200).json({ info: `Queue ${queuename} emptied successfully` });
    } catch (error) {
        console.error(`Failed to delete queue ${queuename}:`, error);
    }
};


module.exports = { getQueueJobs, deleteJob, pauseQueue, resumeQueue, emptyQueue , deleteQueue};
