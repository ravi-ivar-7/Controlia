const { Queue } = require('bullmq');
const queueInstance = (queueName) => {
    return new Queue(queueName, {
        connection: {
            host: 'localhost',
            port: 6379,
        },
    });
};


//https://localhost:3002/user/checkJobStatus/9?closeJob=true&includeData=false
const checkJobStatus = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const { closeJob, includeData,queueName } = req.query

        const job = await queueInstance(queueName).getJob(jobId);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (closeJob === 'true') {
            if (job.isCompleted() || job.isFailed()) {
                return res.status(400).json({ message: "Job is already completed or failed" });
            }
            await job.moveToCompleted();
            return res.status(200).json({ message: `Job ${jobId} completed!` });
        }

        if (includeData !== 'true') {
            delete job.data;
        }

        return res.status(200).json({ job: job });

    } catch (error) {
        console.error("Error checking job status:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

const getAllJobs = async (req, res) => {
    try {
        const { includeData, queueName } = req.query
        const jobs = await queueInstance(queueName).getJobs(['waiting', 'active', 'completed', 'failed', 'delayed']);
        if (jobs) {
            let response = jobs.map(job => {
                // let jobResponse = job
                if (includeData !== 'true') {
                    delete job.data;
                }
        
                return job;
            });
            return res.status(200).json({ jobs: response })
        }
    } catch (error) {
        console.error("Error getting all jobs:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


const getAllQueues = async (req, res) => {
    try {
        const allQueues = await Queue.getQueues();
        const queueNames = allQueues.map(queue => queue.name);
        return res.status(200).json({ queues: queueNames });
    } catch (error) {
        console.error("Error getting queues:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

const cleanQueue = async (req, res) => {
    const { queueName } = req.query;

    try {
        // Create a queue instance based on the provided queueName
        const queue = queueInstance(queueName)
        await queue.drain();

        return res.status(200).json({ message: `Queue ${queueName} cleaned` });
    } catch (error) {
        console.error("Error cleaning queue:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { getAllJobs, checkJobStatus, getAllQueues, cleanQueue };


