const express = require('express');
const router = express.Router();

const { extractLimit } = require('../middlewares/rateLimiter')

const { checkServer } = require('../utils/checkServer');

const { verifyToken } = require('../middlewares/verifyToken')
const { loginUser } = require('../controllers/user/login');
const { registerUser } = require('../controllers/user/register');

router.get('/', async (req, res) => { res.status(200).json({ status: "ok", ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip, userAgent: req.headers['user-agent'] }) })
router.get('/check-server', checkServer)

const { addExecuteScript } = require('../controllers/executes/addExecuteScript');
const { getExecuteScript } = require('../controllers/executes/getExecuteScript');
const {deleteExecuteScript} = require('../controllers/executes/deleteExecuteScript')
const {editExecuteScript} = require('../controllers/executes/editExecuteScript')


router.post('/get-execute-script', verifyToken,getExecuteScript);
router.post('/add-execute-script',verifyToken, addExecuteScript)
router.post('/delete-execute-script',verifyToken, deleteExecuteScript)
router.post('/edit-execute-script',verifyToken, editExecuteScript)

router.get('/validate-token', verifyToken, (req, res) => { return res.status(200).json({ message: 'Token is valid', userData: req.data }); });


router.post('/login', loginUser);
router.post('/register', registerUser);

module.exports = router;
