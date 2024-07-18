const express = require('express');
const router = express.Router();

const { extractLimit } = require('../middlewares/rateLimiter')

const { checkServer, startWorkerServer } = require('../services/systems/server');

const { verifyToken } = require('../middlewares/verifyToken')
const { loginWithNewContainer } = require('../services/docker/login');
const { registerUser } = require('../controllers/user/register');
const {getLogs} =require('../services/logs/getLogs')
const {manageContainer} = require('../services/docker/manageContainer')

const {saveFile, getFile, deleteFile} = require('../controllers/files/files')
const {execVolumeFile} = require('../controllers/files/execVolumeFile')
const {accessTerminal} = require('../services/docker/accessTerminal')
const {newEnv} = require('../services/docker/newEnv')



const {getQueueJobs, deleteJob, pauseQueue, resumeQueue, emptyQueue, deleteQueue} = require('../services/tasks/manageQueues')

const {getAllScripts, getScriptContent} = require('../controllers/scripts/getScripts')
const {saveScript} = require('../controllers/scripts/saveScripts');
const { deleteScripts } = require('../controllers/scripts/deleteScripts');

const { scheduleScript } = require('../controllers/schedule/scheduleScript');
const {getScheduleScripts} = require('../controllers/schedule/getScheduleScripts')
const {ResetScheduleScript} = require('../controllers/schedule/resetScriptSchedule')

router.get('/', async (req, res) => { res.status(200).json({ status: "ok", ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip, userAgent: req.headers['user-agent'] }) })
router.get('/check-server', checkServer)

router.get('/validate-token', verifyToken, (req, res) => { return res.status(200).json({ message: 'Token is valid', userData: req.data }); });

// user related
router.post('/login', loginWithNewContainer);
router.post('/register', newEnv);

// scripts related
router.post('/scripts', verifyToken, getAllScripts)
router.post('/script', verifyToken, getScriptContent)
router.post('/save-script', verifyToken, saveScript)
router.post('/delete-script', verifyToken, deleteScripts)

// schedule related
router.post('/schedule-script', verifyToken, scheduleScript)
router.post('/get-schedule-scripts', verifyToken, getScheduleScripts)
router.post('/reset-scripts-schedule', verifyToken, ResetScheduleScript)


router.get('/manage-container',manageContainer);
router.get('/access-terminal/:cmd',accessTerminal)

router.get('/save-file',saveFile)
router.get('/get-file',getFile)
router.get('/delete-file', deleteFile)
router.get('/exec-file', execVolumeFile)




router.get('/get-queue-jobs/:queuename', getQueueJobs)
router.get('/delete-queue-job/:queuename/:scheduleId', deleteJob)
router.get('/pause-queue/:queuename', pauseQueue)
router.get('/resume-queue/:queuename', resumeQueue)
router.get('/empty-queue/:queuename/', emptyQueue)
router.get('/delete-queue/:queuename/', deleteQueue)



router.get('/get-logs/:filename',getLogs)


module.exports = router;
