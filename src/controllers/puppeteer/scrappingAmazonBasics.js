const puppeteer = require('puppeteer')

const scrapingAmazonBasics = async (req, res) => {
    try {
      const browser = await puppeteer.launch({
        headless:false, // to open browser
        defaultViewport:false,
        userDataDir:"./tmp"
      });

      const page = await browser.newPage();
  
      await page.goto('https://www.amazon.in/b?ie=UTF8&node=6637738031');
  

      const productHandles = await page.$$('a-section a-spacing-none')
      console.log(productHandles)
      for(const productHandle of productHandles){
        const singleProduct = await page.evaluate(el =>el.innerText, productHandle)

        console.log(singleProduct)
      }



      // await browser.close(); 
      res.json({message:'success' });

    } catch (error) {
      console.error('Error scraping page:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

module.exports = {scrapingAmazonBasics}