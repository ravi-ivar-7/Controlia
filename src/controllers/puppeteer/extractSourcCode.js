const puppeteer = require('puppeteer');
const path = require('path');


const extractSourcCode = async (req, res) => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            // userDataDir: "./tmp"
        });

        const page = await browser.newPage();

        const website_url = 'https://www.amazon.in';
        await page.goto(website_url, { timeout: 60000 });

        const sourceCode = await page.content();



        await browser.close(); 
        
        // Send the HTML content as response
        res.json({ message: 'success', sourceCode });

    } catch (error) {
        console.error('Error scraping page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { extractSourcCode }