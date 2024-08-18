const express = require('express');
const router = express.Router();

const { extractLimit } = require('../middlewares/rateLimiter')

const { checkServer } = require('../services/systems/server');
const {getLogs} =require('../services/logs/getLogs')


const { verifyToken } = require('../middlewares/verifyToken')
const { loginWithContainer } = require('../controllers/user/loginWithContainer');
const { registerWithContainer } = require('../controllers/user/registerWithContainer');
const {githubAuth} = require('../controllers/user/githubAuth')
const {googleAuth} = require('../controllers/user/googleAuth')

const {downloadGithubRepoToNewContainer} = require('../controllers/projects/downloadGithubRepos')
const {getProjects} = require('../controllers/projects/getProjects')

const {getQueueJobs, deleteQueueJob, pauseQueue, resumeQueue, emptyQueue,} = require('../services/queuesAndTasks/manageQueues')

const { jupyterServer } = require('../controllers/notebooks/startJupyterServer');
const { getNotebooks } = require('../controllers/notebooks/getNotebooks');


const {scheduleNotebook} = require('../controllers/notebooks/schduleNotebook');
const { deleteProjectContainer } = require('../controllers/projects/deleteProjectContainers');

const { startPortainer } = require('../services/portainer/managePortainerContainer');


// system related
router.get('/', async (req, res) => { res.status(200).json({ status: "ok", ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip, userAgent: req.headers['user-agent'] }) })
router.get('/check-server', checkServer)

// user related
router.post('/login', loginWithContainer);
router.post('/register', registerWithContainer);
router.get('/validate-token', verifyToken, (req, res) => { return res.status(200).json({ message: 'Token is valid', userData: req.data }); });

router.post('/google-auth', googleAuth);
router.post('/github-auth', githubAuth);
router.post('/download-github-repo',verifyToken, downloadGithubRepoToNewContainer);
router.post('/projects', verifyToken, getProjects)
router.post('/delete-project', verifyToken, deleteProjectContainer)

// notebooks related
router.post('/start-jupyter-server', verifyToken,jupyterServer)
router.post('/notebooks', verifyToken,getNotebooks)
router.post('/schedule-notebook', verifyToken,scheduleNotebook)

// job/queues/tasks related
router.get('/get-queue-jobs/:queuename', getQueueJobs)
router.get('/delete-queue-job/:queuename/:scheduleId', deleteQueueJob)
router.get('/pause-queue/:queuename', pauseQueue)
router.get('/resume-queue/:queuename', resumeQueue)
router.get('/empty-queue/:queuename/', emptyQueue)

router.get('/start-portainer', startPortainer)

// logs related
router.get('/get-logs/:filename',getLogs)


module.exports = router;
