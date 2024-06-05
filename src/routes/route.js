const express = require('express');
const router = express.Router();
const {extractLimit} = require('../middlewares/rateLimiter')

// puppeteer webscrapping
const {takingScreenShot} = require('../controllers/puppeteer/takingScreenShot')
const {extractSourcCode} = require('../controllers/puppeteer/extractSourcCode')
const {extractLinksImg} = require('../controllers/puppeteer/extractLinksImg')
const {extractSEO} = require('../controllers/puppeteer/extractSEO')
const {formSubmission}= require('../controllers/puppeteer/formSubmission')
const {interceptHTTP } = require('../controllers/puppeteer/interceptHTTP')
const {simulateMobileDevice } = require('../controllers/puppeteer/simulateMobileDevice')
const {emulateDevice } = require('../controllers/puppeteer/emulateDevice')
const { getCodeCoverage} = require('../controllers/puppeteer/getCodeCoverage')
const { disableJS} = require('../controllers/puppeteer/disableJS')
const { highLightPageLinks} = require('../controllers/puppeteer/highLightPageLinks')
const { findBrokenLinks} = require('../controllers/puppeteer/findBrokenLinks')
const { findWebpageElements} = require('../controllers/puppeteer/findWebpageElements')
const { massDataExtraction} = require('../controllers/puppeteer/massDataExtraction')
// not working
const {scrapingAmazonBasics} = require('../controllers/puppeteer/scrappingAmazonBasics')
const {takingPDF} = require('../controllers/puppeteer/takingPDF')
const {githubTesting} = require('../controllers/puppeteer/githubTesting')

const {backForwardFakeGeolocation } = require('../controllers/puppeteer/backForwardFakeGeolocation')

// node scheduler
const { scheduledJob , startRecurringJob,cancelRecurringJob} = require('../controllers/nodeScheduler/nodeScheduler')
const { scheduleApiCall} = require('../controllers/nodeScheduler/nodeSchedulerAPIcall')


// bull background worker
// const { } = require('../controllers/')
// const { } = require('../controllers/')
// const { } = require('../controllers/')



router.get('/takingScreenShot',takingScreenShot);
router.get('/extractSourcCode',extractSourcCode)
router.get('/extractLinksImg',extractLinksImg)
router.get('/extractSEO',extractSEO)
router.get('/formSubmission',formSubmission)
router.get('/interceptHTTP',interceptHTTP)
router.get('/simulateMobileDevice',simulateMobileDevice)
router.get('/emulateDevice',emulateDevice)
router.get('/getCodeCoverage',getCodeCoverage)
router.get('/disableJS',extractLimit, disableJS)
router.get('/highLightPageLinks',highLightPageLinks)
router.get('/findBrokenLinks',findBrokenLinks)
router.get('/findWebpageElements',findWebpageElements)
router.get('/massDataExtraction',massDataExtraction)
router.get('/backForwardFakeGeolocation',backForwardFakeGeolocation)
router.get('/scrapingAmazonBasics',scrapingAmazonBasics)
router.get('/takingPDF',takingPDF)
router.get('/githubTesting',githubTesting)


// node scheduler
router.get('/scheduledJob',scheduledJob)
router.get('/startRecurringJob',startRecurringJob)
router.get('/cancelRecurringJob',cancelRecurringJob)
router.get('/scheduleApiCall',scheduleApiCall)

// bull background worker

router.get('/',)

router.get('/',)
router.get('/',)









module.exports = router;
