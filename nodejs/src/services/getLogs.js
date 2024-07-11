const fs = require('fs');
const path = require('path');

const getLogs = async (req, res) => {
    try {
        const { filename } = req.params;

        const logFilePath = path.join(__dirname, `../${filename}`);

        fs.readFile(logFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading ${filename}:`, err);
                res.status(500).send(`Error reading ${filename}`);
                return;
            }

            res.header('Content-Type', 'text/plain');
            res.send(data);
        });
    } catch (err) {
        console.error('Error retrieving logs:', err);
        res.status(209).json({warn:`Error retrieving logs: ${err}`});
    }
};

module.exports = { getLogs };
