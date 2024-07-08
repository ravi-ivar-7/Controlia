require('dotenv').config({path:'../../config/env/.env'});
const jwt = require('jsonwebtoken');

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
        console.error("ERROR GENERATING TOKEN: ", err);
        throw err; 
    }
};


module.exports = { generateToken}