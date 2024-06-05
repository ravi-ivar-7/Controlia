const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const extractSEO = async (req, res) => {
    try {
        const browser = await puppeteer.launch({
            slowMo: 50, // Add some delay to better observe the browser actions
            headless: false, // to open browser visibly
            defaultViewport: null, // Ensures full page width
            userDataDir: "./tmp"
        });

        const page = await browser.newPage();

        const website_url = 'https://yahoo.com';
        await page.goto(website_url, { waitUntil: 'networkidle2', timeout: 60000 });

        // seo related data
        const title = await page.title();
        const metaDescription = await page.$eval('meta[name="description"]', element => element.getAttribute('content').trim()).catch(() => null);
        const metaKeywords = await page.$eval('meta[name="keywords"]', element => element.getAttribute('content').trim()).catch(() => null);

        const result = { title, metaDescription, metaKeywords };

        // await fs.writeFile("SEO_result_yahoo.json", JSON.stringify(result, null, 2));
        await browser.close();
        res.json(result);

    } catch (error) {
        console.error('Error scraping page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { extractSEO };