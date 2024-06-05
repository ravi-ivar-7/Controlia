const puppeteer = require('puppeteer');

const disableJS = async (req, res) => {
    try {
        const browser = await puppeteer.launch({
            slowMo: 50,
            headless: false,
            defaultViewport: null,
            userDataDir: "./tmp"
        });
        const page = await browser.newPage();

        await page.setJavaScriptEnabled(false) // disable js
        console.log('JS disabled')
        const website_url = 'https://yahoo.com';
        await page.goto(website_url)

        // perform some operations


        await browser.close();
        res.json({});

    } catch (error) {
        console.error('Error scraping page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {disableJS  };