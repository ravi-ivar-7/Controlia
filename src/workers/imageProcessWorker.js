const { imageProcessService } = require('../services/imageProcessService');
const { Worker } = require("bullmq");

const workerOptions = { connection: { host: "localhost", port: 6379 } };

const imageProcessWorkHandler = async (job) => {
    try {
        console.log('started job')
        await imageProcessService(job.data);
        console.log(`Completed job ${job.name}`);
    } catch (err) {
        console.error(`ERROR OCCURRED DURING ${job.name} JOB`, err);
    }
}

const worker = new Worker('imageProcessQueue', imageProcessWorkHandler, workerOptions);

console.log('Worker started');


// cd src; cd workers; node imageProcessWorker
