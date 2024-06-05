const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const interceptHTTP = async (req, res) => {
    try {
        const browser = await puppeteer.launch({
            slowMo: 50,
            headless: false,
            defaultViewport: null,
            userDataDir: "./tmp"
        });

        const page = await browser.newPage();

        // intercepting page
        await page.setRequestInterception(true)
        // custom logic to handle incoming request
        page.on('request', (interceptedRequest) => {
            // custom logic
            if (interceptedRequest.url().endsWith('.png')) {
                interceptedRequest.abort()
                console.log('request aborted')
            } else {
                interceptedRequest.headers({ 'secretKey': 'abcd123' })// manipulated request
                interceptedRequest.continue()
                console.log('request continue with headers secket keys')
            }
        })
        const website_url = 'https://yahoo.com';

        await page.goto(website_url)

        await browser.close();
        res.json({});

    } catch (error) {
        console.error('Error scraping page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { interceptHTTP };