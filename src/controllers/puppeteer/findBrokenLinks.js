const puppeteer = require('puppeteer');

const findBrokenLinks = async (req, res) => {
    try {
        const browser = await puppeteer.launch({
            slowMo: 50,
            headless: false,
            defaultViewport: null,
            userDataDir: "./tmp"
        });
        const page = await browser.newPage();

        const website_url = 'https://google.com';
        await page.goto(website_url);

        const links = await page.$$eval('a', anchor => anchor.map(a => a.href));
        const brokenLinks = [];

        for (const link of links) {
            const response = await page.goto(link, { waitUntil: 'networkidle0', timeout: 50000 });
            if (response.status >= 400) {
                brokenLinks.push({ link, status: response.status });
            }
        }

        await browser.close();
        res.json({ brokenLinks });

    } catch (error) {
        console.error('Error scraping page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { findBrokenLinks };
