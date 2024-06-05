const puppeteer = require('puppeteer');

const simulateMobileDevice = async (req, res) => {
    try {
        const browser = await puppeteer.launch({
            slowMo: 50,
            headless: false,
            defaultViewport: null,
            userDataDir: "./tmp"
        });
        const page = await browser.newPage();

        await page.setUserAgent('iPhone 05')
        await page.setViewport({width:375, height:812})

        const website_url = 'https://yahoo.com';
        await page.goto(website_url)

        await browser.close();
        res.json({});

    } catch (error) {
        console.error('Error scraping page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {simulateMobileDevice  };