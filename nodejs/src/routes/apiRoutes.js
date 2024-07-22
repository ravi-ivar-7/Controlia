const express = require('express');
const router = express.Router();

const { extractLimit } = require('../middlewares/rateLimiter')

const { checkServer } = require('../services/systems/server');
const {getLogs} =require('../services/logs/getLogs')


const { verifyToken } = require('../middlewares/verifyToken')
const { loginWithContainer } = require('../controllers/user/loginWithContainer');
const { registerWithContainer } = require('../controllers/user/registerWithContainer');


const {getWorkspaceInfo} = require('../controllers/containers/getContainerInfo')
const {getWorkspaceFiles, downloadVolumeData} = require('../controllers/containers/manageVolumeFiles')
const {saveFileToVolume, getFileFromVolume, deleteFileFromVolume} = require('../controllers/files/manageVolumeFiles')

const {getQueueJobs, deleteQueueJob, pauseQueue, resumeQueue, emptyQueue,} = require('../services/queuesAndTasks/manageQueues')

const {getAllScripts, getScriptContent} = require('../controllers/scripts/getScripts')
const {saveScript} = require('../controllers/scripts/saveScripts');
const { deleteScripts } = require('../controllers/scripts/deleteScripts');

const { jupyterServer } = require('../controllers/notebooks/startJupyterServer');
const { getAllNotebooks } = require('../controllers/notebooks/getNotebooks');


const { scheduleScript } = require('../controllers/scripts/scheduleScript');
const {getScheduleScripts} = require('../controllers/scripts/getScheduleScripts')
const {ResetScheduleScript} = require('../controllers/scripts/resetScriptSchedule');
const { containerModule } = require('../controllers/containers/containerModules');
const { containerCommand } = require('../controllers/containers/containerCommand');



// system related
router.get('/', async (req, res) => { res.status(200).json({ status: "ok", ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip, userAgent: req.headers['user-agent'] }) })
router.get('/check-server', checkServer)

// user related
router.post('/login', loginWithContainer);
router.post('/register', registerWithContainer);
router.get('/validate-token', verifyToken, (req, res) => { return res.status(200).json({ message: 'Token is valid', userData: req.data }); });

// scripts related
router.post('/scripts', verifyToken, getAllScripts)
router.post('/script', verifyToken, getScriptContent)
router.post('/save-script', verifyToken, saveScript)
router.post('/delete-script', verifyToken, deleteScripts)

// schedule related
router.post('/schedule-script', verifyToken, scheduleScript)
router.post('/get-schedule-scripts', verifyToken, getScheduleScripts)
router.post('/reset-scripts-schedule', verifyToken, ResetScheduleScript)

// notebooks related
router.post('/start-jupyter-server', verifyToken,jupyterServer)
router.post('/notebooks', verifyToken,getAllNotebooks)


// volume files related
router.get('/save-file-to-volume',verifyToken, saveFileToVolume)
router.get('/get-file-from-volume',verifyToken, getFileFromVolume)
router.get('/delete-file-from-volume', verifyToken, deleteFileFromVolume)

// workspace/container related
router.post('/get-workspace-details', verifyToken,getWorkspaceInfo);
router.post('/get-workspace-files', verifyToken,getWorkspaceFiles);
router.post('/download-workspace-data', verifyToken,downloadVolumeData);
router.post('/install-container-module', verifyToken,containerModule);
router.post('/rum-container-command', verifyToken,containerCommand);

// job/queues/tasks related
router.get('/get-queue-jobs/:queuename', getQueueJobs)
router.get('/delete-queue-job/:queuename/:scheduleId', deleteQueueJob)
router.get('/pause-queue/:queuename', pauseQueue)
router.get('/resume-queue/:queuename', resumeQueue)
router.get('/empty-queue/:queuename/', emptyQueue)


// logs related
router.get('/get-logs/:filename',getLogs)


module.exports = router;
