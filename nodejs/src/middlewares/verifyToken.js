const jwt = require("jsonwebtoken");
require('dotenv').config({path:'../../.env'});
const logger = require('../services/logs/winstonLogger')

const verifyToken = (req, res, next) => {
  const bearer = req.headers['authorization'];
  if (!bearer) {
      return res.status(209).json({ warn: 'NO BEARER TOKEN' });
  }

  const token = bearer.split(" ")[1];
  if (!token) {
      return res.status(209).json({ warn: 'NO TOKEN IN BEARER' });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

    req.body = {...req.body,decodedToken};

  } catch (err) {
    logger.error(`Cannot verify token, ${err}`)
    return res.status(209).json({warn : "CANNOT VERIFY TOKEN: INVALID OR EXPIRED TOKEN"} );
  }
  return next();
};


const verifySocketToken = (socket, next) => {
  const bearer = socket.handshake.headers['authorization'];
  if (!bearer) {
    return next(new Error('NO BEARER TOKEN'));
  }

  const token = bearer.split(' ')[1];
  if (!token) {
    return next(new Error('NO TOKEN IN BEARER'));
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    socket.decodedToken = decodedToken;
    next();
  } catch (err) {
    logger.error(`Cannot verify token, ${err}`);
    return next(new Error('CANNOT VERIFY TOKEN: INVALID OR EXPIRED TOKEN'));
  }
};




module.exports = {verifyToken, verifySocketToken};