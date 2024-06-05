const schedule = require('node-schedule');
const axios = require('axios');

const scheduleApiCall = async (req, res) => {
    try {
        // Schedule job to run every 10 seconds with an initial delay of 5 seconds
        schedule.scheduleJob({ start: Date.now() + 5000, rule: '*/30 * * * * *' }, async () => {
            try {
                const response = await axios.get('https://jsonplaceholder.typicode.com/posts/12');
                console.log("API call made!");
                console.log(response.data);

                // Send data to another API
                const postData = {
                    by:`Anom on ${Date.now()}`,
                    title: response.data.title,
                    body: response.data.body,
                };
                const sendingResponse = await axios.post('https://jsonplaceholder.typicode.com/posts', postData);
                console.log("Data sent to another API:", sendingResponse.data);

            } catch (error) {
                console.error("Error in recurring job:", error);
                throw error;
            }
        });

        console.log("Scheduled recurring job every 10 seconds.");
        res.status(200).json({ message: "Scheduled recurring job every 10 seconds." });

    } catch (error) {
        console.error("Error scheduling API call:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { scheduleApiCall };
