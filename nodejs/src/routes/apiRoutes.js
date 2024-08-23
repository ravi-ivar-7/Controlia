const express = require('express');
const router = express.Router();

const { checkServer } = require('../services/systems/server');
const { getLogs } = require('../services/logs/getLogs')


const { verifyToken } = require('../middlewares/verifyToken')

const { login } = require('../controllers/user/login')
const { register } = require('../controllers/user/register')

const { githubAuth } = require('../controllers/user/githubAuth')
const { googleAuth } = require('../controllers/user/googleAuth')

const { newWorkspaceContainer } = require('../controllers/workspace/newWorkspace')
const { getWorkspaceInfo, changeWorkspaceResource, startCodeServer, stopCodeServer } = require('../controllers/workspace/configWorkspace')
const { getWorkspaces } = require('../controllers/workspace/getWorkspaces')
const { deleteWorkspaceContainer } = require('../controllers/workspace/deleteWorkspace')



const { startPortainer } = require('../services/portainer/managePortainerContainer');


// system related
router.get('/', async (req, res) => { res.status(200).json({ status: "ok", ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip, userAgent: req.headers['user-agent'] }) })
router.get('/check-server', checkServer)

// user related
router.get('/validate-token', verifyToken, (req, res) => { return res.status(200).json({ message: 'Token is valid', userData: req.data }); });

router.post('/login', login);
router.post('/register', register);
router.post('/google-auth', googleAuth);
router.post('/github-auth', githubAuth);

// workspace related
router.post('/new-workspace', verifyToken, newWorkspaceContainer);
router.post('/workspaces', verifyToken, getWorkspaces)
router.post('/delete-workspace', verifyToken, deleteWorkspaceContainer)
router.post('/get-workspace-info', verifyToken, getWorkspaceInfo)
router.post('/delete-workspace', verifyToken, changeWorkspaceResource)
router.post('/start-codeserver', verifyToken, startCodeServer)
router.post('/stop-codeserver', verifyToken, stopCodeServer)


// docker related
router.get('/start-portainer', startPortainer)

// logs related
router.get('/get-logs/:filename', getLogs)


module.exports = router;
