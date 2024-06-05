const puppeteer = require('puppeteer');
const device = puppeteer.KnownDevices['BlackBerry Z30 landscape']

const emulateDevice = async (req, res) => {
    try {
        const browser = await puppeteer.launch({
            slowMo: 50,
            headless: false,
            defaultViewport: null,
            userDataDir: "./tmp"
        });
        const page = await browser.newPage();

        await page.emulate(device)

        const website_url = 'https://yahoo.com';
        await page.goto(website_url)

        await browser.close();
        res.json({});

    } catch (error) {
        console.error('Error scraping page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {emulateDevice  };