const { Queue } = require("bullmq");
const redisOptions = { host: "localhost", port: 6379 };

const queue = new Queue("imageProcessQueue", { connection: redisOptions });// Create the queue instance once for a particular type of job

const addToImageProcessQueue = async (job) => {
    try {
        const addedJob = await queue.add(job.type, job, {
            delay: 10 * 1000, // Optional delay before processing
            ttl: 3600 * 1000, // TTL in milliseconds (e.g., 1 hour)
            removeOnComplete : 20,
            removeOnFail : 20,
            
        });
        console.log('Added job to queue:', addedJob.id);
        return addedJob.id;
    } catch (error) {
        console.error("Error adding job to queue:", error);
        throw error;
    }
}

const imageProcess = async (req, res) => {
    try {
        const { image } = req.files;

        if (!image) {
            return res.status(400).json({ error: "No image provided" });
        }

        const jobId = await addToImageProcessQueue({
            type: "imageProcess",
            image: {
                name: image.name,
                data: image.data.toString("base64")
            }
        });

        return res.status(200).json({ message: "Image will be processed shortly.", jobId });
    } catch (err) {
        console.error("ERROR OCCURRED DURING IMAGE PROCESSING", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { imageProcess };
