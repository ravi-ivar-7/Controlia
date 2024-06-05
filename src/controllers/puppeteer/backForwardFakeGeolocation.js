const puppeteer = require('puppeteer');

const latitude = 37.7749;
const longitude = -122.4194;

const backForwardFakeGeolocation = async (req, res) => {
    try {
        const browser = await puppeteer.launch({
            slowMo: 50,
            headless: false,
            defaultViewport: null,
            userDataDir: "./tmp"
        });
        const page = await browser.newPage();

        let originalGeolocation = {}, fakedGeolocation = {};
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                originalGeolocation = page.evaluate(() => {
                    return {
                        latitude: navigator.geolocation.getCurrentPosition().coords.latitude,
                        longitude: navigator.geolocation.getCurrentPosition().coords.longitude
                    };
                });
            });
        } else {
            originalGeolocation = { error: "Geolocation is not supported by this browser." }
        }


        // Set geolocation
        await page.setGeolocation({ latitude, longitude });

        await page.goto('https:/yahoo.com/');
        const title = await page.title();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                fakedGeolocation = page.evaluate(() => {
                    return {
                        latitude: navigator.geolocation.getCurrentPosition().coords.latitude,
                        longitude: navigator.geolocation.getCurrentPosition().coords.longitude
                    };
                });
            });
        } else {
            fakedGeolocation = { error: "Geolocation is not supported by this browser." }
        }

        // Perform navigation actions
        // await page.goBack();

        await browser.close();

        res.json({ originalGeolocation, fakedGeolocation, title });

    } catch (error) {
        console.error('Error scraping page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { backForwardFakeGeolocation };
