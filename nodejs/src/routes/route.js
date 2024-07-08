const express = require('express');
const router = express.Router();

const { extractLimit } = require('../middlewares/rateLimiter')
const { verifyToken } = require('../middlewares/verifyToken')

const { serverCheck } = require('../controllers/server_check');
const { addExecutionScript } = require('../controllers/executes/addExecutionScript');
const { getExecutionScript } = require('../controllers/executes/getExecutionScript');
const { loginUser } = require('../controllers/user/login');
const { registerUser } = require('../controllers/user/register');

router.get('/', async (req, res) => { res.status(200).json({ status: "ok", ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip, userAgent: req.headers['user-agent'] }) })
router.get('/ping', serverCheck)


router.post('/get-execution-script', verifyToken,getExecutionScript);
router.post('/add-execution-script',verifyToken, addExecutionScript)

router.get('/validate-token', verifyToken, (req, res) => { return res.status(200).json({ message: 'Token is valid', userData: req.data }); });


router.post('/login', loginUser);
router.post('/register', registerUser);

module.exports = router;
