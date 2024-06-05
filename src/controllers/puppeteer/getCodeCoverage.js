const puppeteer = require('puppeteer');

const getCodeCoverage = async (req,res) => {
    try {
        const browser = await puppeteer.launch({
            headless: true, // Set to true for production use
            defaultViewport: null,
            args: ['--no-sandbox'], // Add this for security
        });
        const page = await browser.newPage();

        // Start code coverage for CSS and JavaScript
        await Promise.all([
            page.coverage.startCSSCoverage(),
            page.coverage.startJSCoverage(),
        ]);

        const websiteUrl = 'https://example.com';
        await page.goto(websiteUrl);

        // Perform additional operations here (e.g., get page title)

        // Stop code coverage and get coverage data
        const [jsCoverage, cssCoverage] = await Promise.all([
            page.coverage.stopJSCoverage(),
            page.coverage.stopCSSCoverage(),
        ]);

        let totalBytes = 0;
        let usedBytes = 0;

        // Calculate total and used bytes for JavaScript coverage
        for (const entry of jsCoverage) {
            totalBytes += entry.text.length;
            for (const range of entry.ranges) {
                usedBytes += range.end - range.start - 1;
            }
        }

        // Calculate total and used bytes for CSS coverage
        for (const entry of cssCoverage) {
            totalBytes += entry.text.length;
            for (const range of entry.ranges) {
                usedBytes += range.end - range.start - 1;
            }
        }

        console.log('Total Bytes:', totalBytes);
        console.log('Used Bytes:', usedBytes);

        await browser.close();

        res.json({totalBytes, usedBytes});

    } catch (error) {
        console.error('Error scraping page:', error);
    }
};

module.exports =  {getCodeCoverage};


// Coverage helps you find parts of  code that are not exercised during scraping. These uncovered areas might contain bugs or unhandled scenarios.
//  measurement of how much of your code is executed while interacting with a web page. 

//Total bytes refer to the cumulative size (in bytes) of all the JavaScript and CSS code loaded by a web page.
// sum up the lengths of all JavaScript files (including inline scripts) loaded on the page

// Used bytes represent the portion of total bytes that is actually executed or applied during the interaction with the web page.
// consider the ranges (start and end positions) where code execution occurs. Subtract the unused portions from the total bytes.