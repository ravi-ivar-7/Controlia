const puppeteer = require('puppeteer');

// The URLs are processed concurrently
const urls = ['https://yahoo.com', 'https://google.com', 'https://example.com','https://codeforces.com/','https://vshalliitkgp.in/'];

const massDataExtraction = async (req, res) => {
    try {
        const browser = await puppeteer.launch({
            slowMo: 50,
            headless: false,
            defaultViewport: null,
            userDataDir: "./tmp"
        });

        
        let scrapedDataArray = [];

        const scrapingPromises = urls.map(async (url) => { // array of promises
            const page = await browser.newPage();
            await page.goto(url);
            const data = await page.evaluate(() => {
                const title = document.querySelector('h1')?.textContent?.trim() || '';
                const description = document.querySelector('p')?.textContent?.trim() || '';
                return { title, description };
            });
            await page.close();
            return data;
        });

        scrapedDataArray = await Promise.all(scrapingPromises); // wait for all promises to resolve.

        await browser.close();
        res.json({ scrapedDataArray });
    } catch (error) {
        console.error('Error scraping page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { massDataExtraction };


// We use Promise.all(scrapingPromises) to wait for all promises to resolve.
// This ensures that all URLs are processed concurrently.