const puppeteer = require('puppeteer')

const takingScreenShot = async (req, res) => {
    try {
      const browser = await puppeteer.launch({
        headless:false // to open browser
      });

      const page = await browser.newPage();
  
      await page.goto('https://example.com');
  
      await page.screenshot({path:'example.png'})

      await browser.close(); 
  
      res.json({message:'success' });

    } catch (error) {
      console.error('Error scraping page:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

module.exports = {takingScreenShot}