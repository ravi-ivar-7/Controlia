const puppeteer = require('puppeteer');

const findWebpageElements = async (req, res) => {
    try {
        const browser = await puppeteer.launch({
            slowMo: 50,
            // headless: false,
            defaultViewport: null,
            userDataDir: "./tmp"
        });
        const page = await browser.newPage();

        const website_url = 'https://yahoo.com';
        await page.goto(website_url);

        const findElements = ['.header', '#main-content', 'footer', 'div']; // class, id, etc
        const results = {};

        for (const element of findElements) {
            const foundElements = await page.$$(element);
            results[element] = foundElements.length;
        }

        await browser.close();
        res.json({ results });

    } catch (error) {
        console.error('Error scraping page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {findWebpageElements}