const jwt = require('jsonwebtoken');
require('dotenv').config({path:'./config/keys/.env'});

const decodedToken = (token) => {
    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        return decodedToken;

    } catch (error) {
        console.error('ERROR DECODING TOKEN: ', error);
        return null; 
    }
};

module.exports = { decodedToken }