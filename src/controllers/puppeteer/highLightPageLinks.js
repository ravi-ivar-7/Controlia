const puppeteer = require('puppeteer');

const highLightPageLinks = async (req, res) => {
    try {
        const browser = await puppeteer.launch({
            slowMo: 50,
            headless: false,
            defaultViewport: null,
            userDataDir: "./tmp"
        });
        const page = await browser.newPage();

        const website_url = 'https://yahoo.com';
        await page.goto(website_url)
        await page.screenshot({path:'beforeHighlight.png'})

        // perform some operations: evaluage=> extract and highlight all 'a' links
        
        await page.evaluate(() =>{
            const links = document.querySelectorAll('a');
            links.forEach(link =>{
                link.style.border = '2px solid red',
                link.style.background = 'yellow'
            })
        })

        await page.screenshot({path:'afterHightlight.png'})


        await browser.close();
        res.json({});

    } catch (error) {
        console.error('Error scraping page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {highLightPageLinks  };