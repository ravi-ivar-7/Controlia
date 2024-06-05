const jwt = require("jsonwebtoken");
require('dotenv').config({path:'./config/keys/.env'});

const verifyToken = (req, res, next) => {
  const bearer = req.headers['authorization'];
  if (!bearer) {
      return res.status(209).json({ error: 'NO BEARER TOKEN' });
  }

  const token = bearer.split(" ")[1];
  if (!token) {
      return res.status(209).json({ message: 'NO TOKEN IN BEARER' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    req.data = decodedToken;
  } catch (err) {
    return res.status(209).json({error : "CANNOT VERIFY TOKEN: INVALID OR EXPIRED TOKEN"} );
  }

  return next();
};

module.exports = {verifyToken};