const express = require('express');
const router = express.Router();

const { extractLimit } = require('../middlewares/rateLimiter')

const { serverCheck } = require('../controllers/server_check');

router.get('/', async (req,res) =>{res.status(200).json({status : "ok", ip : req.headers['x-forwarded-for'] || req.socket.remoteAddress|| req.ip, userAgent:req.headers['user-agent']})})


router.get('/ping', serverCheck)



module.exports = router;
