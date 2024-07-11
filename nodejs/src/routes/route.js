const express = require('express');
const router = express.Router();

const { extractLimit } = require('../middlewares/rateLimiter')

const { checkServer } = require('../utils/checkServer');

const { verifyToken } = require('../middlewares/verifyToken')
const { loginUser } = require('../controllers/user/login');
const { registerUser } = require('../controllers/user/register');

const { addExecuteScript } = require('../controllers/executeScripts/addExecuteScript');
const { getExecuteScript } = require('../controllers/executeScripts/getExecuteScript');
const {deleteExecuteScript} = require('../controllers/executeScripts/deleteExecuteScript')
const {editExecuteScript} = require('../controllers/executeScripts/editExecuteScript')
const {getExecuteLayouts, saveExecuteLayouts} = require('../controllers/executeScripts/layoutExecuteScript')

const {deleteScheduleScript} = require('../controllers/scheduleScripts/deleteScheduleScript')
const {addEditScheduleScript} = require('../controllers/scheduleScripts/addEditScheduleScript')
const {getScheduleLayouts, saveScheduleLayouts} = require('../controllers/scheduleScripts/layoutScheduleScript')
const {getScheduleScript} = require('../controllers/scheduleScripts/getScheduleScript')

const {convertNotebook} = require('../controllers/jupyter/convertNotebook')



router.get('/', async (req, res) => { res.status(200).json({ status: "ok", ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip, userAgent: req.headers['user-agent'] }) })
router.get('/check-server', checkServer)
router.get('/validate-token', verifyToken, (req, res) => { return res.status(200).json({ message: 'Token is valid', userData: req.data }); });

router.post('/login', loginUser);
router.post('/register', registerUser);

router.post('/get-execute-script', verifyToken,getExecuteScript);
router.post('/add-execute-script',verifyToken, addExecuteScript)
router.post('/delete-execute-script',verifyToken, deleteExecuteScript)
router.post('/edit-execute-script',verifyToken, editExecuteScript)
router.get('/get-execute-layout',verifyToken, getExecuteLayouts)
router.post('/save-execute-layout',verifyToken, saveExecuteLayouts)

router.get('/get-schedule-script', verifyToken, getScheduleScript)
router.post('/add-edit-schedule-script',verifyToken, addEditScheduleScript)
router.post('/delete-schedule-script',verifyToken, deleteScheduleScript)
router.get('/get-schedule-layout',verifyToken, getScheduleLayouts)
router.post('/save-schedule-layout',verifyToken, saveScheduleLayouts)

router.post('/convert-notebook',convertNotebook )




module.exports = router;
