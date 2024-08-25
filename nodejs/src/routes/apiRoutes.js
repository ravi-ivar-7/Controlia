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
const { getWorkspaceInfo, changeWorkspaceResource, workspaceAction } = require('../controllers/workspace/configWorkspace')
const { getWorkspaces } = require('../controllers/workspace/getWorkspaces')
const { deleteWorkspaceContainer } = require('../controllers/workspace/deleteWorkspace')
const {restartCodeServer, stopCodeServer} = require('../controllers/workspace/codeserver')
const { port3000Credentials, port5000Credentials } = require('../controllers/workspace/port3000And5000');


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
router.post('/workspace-info', verifyToken, getWorkspaceInfo)
router.post('/change-workspace-resources', verifyToken, changeWorkspaceResource)
router.post('/workspace-action', verifyToken, workspaceAction )// activate, deactivate
router.post('/delete-workspace', verifyToken, deleteWorkspaceContainer)

router.post('/restart-codeserver', verifyToken, restartCodeServer)
router.post('/stop-codeserver', verifyToken,stopCodeServer )


router.post('/port3000-credentials', verifyToken, port3000Credentials)
router.post('/port5000-credentials', verifyToken, port5000Credentials )




// docker related
router.get('/start-portainer', startPortainer)

// logs related
router.get('/get-logs/:filename', getLogs)


module.exports = router;
