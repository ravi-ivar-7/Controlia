const limitter = require('express-rate-limit')

const extractLimit = limitter({
    windowMs:30*1000,
    max:1,
    message:{
        code:429,
        message: 'Request limit exceed'
    } 
})


module.exports ={extractLimit}