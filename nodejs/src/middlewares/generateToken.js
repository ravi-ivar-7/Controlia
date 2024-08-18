require('dotenv').config({path:'../../config/env/.env'});
const jwt = require('jsonwebtoken');
const logger = require('../services/logs/winstonLogger')

const generateToken = (data) => {
    try {
        const payload = {
            ...data
        };

        // const options = {
        //     expiresIn:  '90m'
        // };
        
        const token = jwt.sign(payload, process.env.SECRET_KEY);
        
        return token
    } catch (err) {
        logger.error(`ERROR GENERATING TOKEN: ${err}`);
        throw err; 
    }
};


module.exports = { generateToken}