const puppeteer = require('puppeteer');

const takingPDF = async (req, res) => {
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

        const title = await page.title();
        console.log(title);

        // Wait for a specific element to ensure the page is fully loaded
        await page.waitForSelector('h1', { timeout: 10000 });
        const heading = await page.$eval('h1', element => element.textContent);
        console.log(heading);

        await page.screenshot({ path: 'example.png' });

        // Generate PDF with increased timeout
        await page.pdf({
            path: 'google.pdf',
            format: 'A4',
            timeout: 600000 // Increase timeout for PDF generation
        });

        await browser.close();
        res.json({ message: 'success' });

    } catch (error) {
        console.error('Error scraping page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { takingPDF };