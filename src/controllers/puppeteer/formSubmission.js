const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const formSubmission = async (req, res) => {
    try {
        const searchQuery = 'indian market'
        const browser = await puppeteer.launch({
            slowMo: 50, // Add some delay to better observe the browser actions
            headless: false, // to open browser visibly
            defaultViewport: null, // Ensures full page width
            userDataDir: "./tmp"
        });

        const page = await browser.newPage();

        const website_url = 'https://yahoo.com';
        await page.goto(website_url, { waitUntil: 'networkidle2', timeout: 60000 });

        await page.focus('input[name="p"]');

        await page.keyboard.type(searchQuery)
        await page.keyboard.press('Enter')
        // await page.waitForNavigation({waitUntil :'networkidle2'})

        await page.screenshot({path:'query.png'})

        await browser.close();
        res.json({});

    } catch (error) {
        console.error('Error scraping page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { formSubmission };