const puppeteer = require('puppeteer');

const extractLinksImg = async (req, res) => {
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

        // images
        const images = await page.$$eval('img', elements =>
            elements.map(element => ({
                src: element.src,
                alt: element.alt
            }))
        );

        // links
        const links = await page.$$eval('a', elements =>
            elements.map(element => ({
                href: element.href,
                text: element.textContent.trim()
            }))
        );

        const result = { links, images };

        await browser.close();
        res.json(result);

    } catch (error) {
        console.error('Error scraping page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { extractLinksImg };