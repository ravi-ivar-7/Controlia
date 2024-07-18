const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { accessTerminal } = require('./chatcontroller');
require('dotenv').config({ path: '../../../.env' });

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h1>Hello World</h1>');
});

// WebSocket connection handler
io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('executeCommand', (data) => {
        accessTerminal(socket, data);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
