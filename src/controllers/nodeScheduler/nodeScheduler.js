const schedule = require('node-schedule');
const puppeteer = require('puppeteer');

let recurringJob; // Define a variable to store the reference to the recurring job

const findWebpageElements = async () => {
    try {
        const browser = await puppeteer.launch({
            slowMo: 50,
            headless: false,
            defaultViewport: null,
            userDataDir: "./tmp"
        });
        const page = await browser.newPage();

        const website_url = 'https://example.com';
        await page.goto(website_url);

        const findElements = ['.header', '#main-content', 'footer', 'div']; // class, id, etc
        const results = {};

        for (const element of findElements) {
            const foundElements = await page.$$(element);
            results[element] = foundElements.length;
        }

        await browser.close();
        return results;

    } catch (error) {
        console.error('Error scraping page:', error);
        throw error;
    }
};

const scheduledJob = async (req, res) => {
    try {
        // Schedule job to run once after 5 seconds
        const job = schedule.scheduleJob(new Date(Date.now() + 5000), async () => {
            try {
                const result = await findWebpageElements();
                console.log("Scheduled job done!");
                console.log(result)
                // res.status(200).json({ result }); // make a scheduled api call to get data from another api, to avoid multiple https requests
            } catch (error) {
                console.error("Error in job:", error);
                // res.status(500).json({ error: 'Internal Server Error' });
                throw error
            }
        });

        console.log(`Scheduled job on ${new Date(Date.now() + 5000)} .`);
        res.status(200).json({ message: `Scheduled job on ${new Date(Date.now() + 5000)} .` });

    } catch (error) {
        console.error("Error scheduling job:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

 const startRecurringJob = async (req, res) => {
    try {
        // Schedule job to run every 10 seconds with an initial delay of 5 seconds
        recurringJob = schedule.scheduleJob({ start: Date.now() + 5000, rule: '*/10 * * * * *' }, async () => {
            try {
                const result = await findWebpageElements();
                console.log("Recurring job done!");
                console.log(result)
                // res.status(200).json({ result });
            } catch (error) {
                console.error("Error in recurring job:", error);
                // res.status(500).json({ error: 'Internal Server Error' });
                throw error
            }
        });

        console.log("Scheduled recurring job every 10 seconds.");
        res.status(200).json({ message: "Scheduled recurring job every 10 seconds." });

    } catch (error) {
        console.error("Error scheduling recurring job:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const cancelRecurringJob = async(req,res) =>{
    try{
        if(recurringJob) {
            schedule.cancelJob(recurringJob); // Cancel the recurring job if it exists
            console.log("Recurring job cancelled.");
            res.status(200).json({ message: "Recurring job cancelled." });
        } else {
            console.log("No recurring job to cancel.");
            res.status(200).json({ message: "No recurring job to cancel." });
        }
    } catch(error){
        console.error("Error cancelling recurring job:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports = { scheduledJob, startRecurringJob, cancelRecurringJob };

