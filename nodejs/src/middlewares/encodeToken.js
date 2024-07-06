require('dotenv').config({path:'../../config/env/.env'});
const jwt = require('jsonwebtoken');

const generateToken = (data) => {
    try {
        const payload = {
            data:data,
            issuedAt: Date.now()
        };

        const options = {
            expiresIn: process.env.EXPIRES_IN || '90'
        };
        
        const token = jwt.sign(payload, process.env.SECRET_KEY, options);
        
        return token
    } catch (err) {
        console.error("ERROR GENERATING TOKEN: ", err);
        throw err; 
    }
};


module.exports = { generateToken}