const fs = require('fs');
const path = require('path');

const getLogs = async (req, res) => {
    try {
        const  filename  = req.params.filename;
        const logFilePath = path.join(__dirname, `../../${filename}`);

        fs.readFile(logFilePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).send(`Error reading ${filename}, ${err}`);
                
            }

            res.header('Content-Type', 'text/plain');
            return res.send(data);
        });
    } catch (err) {
        console.log(err)
        return res.status(209).json({warn:`Error retrieving logs: ${err}`});
    }
};

module.exports = { getLogs };
