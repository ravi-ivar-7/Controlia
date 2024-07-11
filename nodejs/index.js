require('dotenv').config({ path: '.env' });
const path = require("path");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const jwt = require('jsonwebtoken'); // Add this line

const routes = require('./src/routes/route');
const wsRoutes = require('./src/routes/wsRoute');

const HTTP_PORT = process.env.HTTP_PORT || 3001;
const HTTPS_PORT = process.env.HTTPS_PORT || 3002;
const HOST = 'localhost';

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// FOR USING SSL/TLS:
let options;
try {
  options = {
    key: fs.readFileSync('./config/ssl/key.pem', 'utf8'),
    cert: fs.readFileSync('./config/ssl/server.crt', 'utf8'),
  };
} catch (err) {
  console.error('ERROR READING SSL/TLS FILES:', err);
  options = null;
}

// FOR HTTPS server
let httpsServer;
if (options) {
  httpsServer = https.createServer(options, app);

  httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS SERVER LISTENING ON ${HOST}:${HTTPS_PORT}`);
  });

  httpsServer.on('error', (err) => {
    console.error('HTTPS SERVER ERROR:', err);
  });
} else {
  console.log('SSL/TLS FILES NOT FOUND. HTTPS SERVER NOT STARTED.');
}

// FOR HTTP server
const httpServer = http.createServer(app);

httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP SERVER LISTENING ON ${HOST}:${HTTP_PORT}`);
});

// WebSocket message handler
function handleWebSocketMessage(message,decodedToken, socket) {
  try {
    const parsedMessage = JSON.parse(message);
    const { route, data } = parsedMessage;
  
    if (wsRoutes[route]) {
      wsRoutes[route](data, decodedToken,socket);
    } else {
      socket.send(JSON.stringify({ error: 'Unknown route' }));
    }
  } catch (error) {
    socket.send(JSON.stringify({ error: 'Invalid message format' }));
  }
}

// Token verification function
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return decoded;
  } catch (error) {
    return null;
  }
}

function handleWebSocketConnection(socket, request) {
  console.log('WS CONNECTED');
  socket.send(JSON.stringify({ data:'Connected...'}));
  const params = new URLSearchParams(request.url.split('?')[1]);
  const token = params.get('token');

  if (!token) {
    console.log('No token')
    socket.close(4001,'Token not provided');
    return;
  }

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    console.log('invalid deocded token')
    socket.close(4002, 'Invalid token');
    return;
  }

  socket.on('open', (message) => {
    console.log('open ws', message);
  });

  socket.on('message', (message) => {
    handleWebSocketMessage(message, decodedToken, socket);
  });

  socket.on('close', (code, reason) => {
    console.log(`WS CLOSED: Code = ${code}, Reason = ${reason}`);
  });

  socket.on('error', (error) => {
    console.error('WS ERROR:', error);
  });
}

// WebSocket server for HTTP/s
const webSocketHttpServer = new WebSocket.Server({ server: httpServer });
webSocketHttpServer.on('connection', handleWebSocketConnection);

if (httpsServer) {
  const webSocketHttpsServer = new WebSocket.Server({ server: httpsServer });
  webSocketHttpsServer.on('connection', handleWebSocketConnection);
}

// HTTP/s routes
app.use('/', routes);

app.all('*', (req, res) => {
  console.log(`Can't find ${req.url} on the server`);
  return res.status(404).json({ message: `Can't find ${req.url} on the server` });
});
