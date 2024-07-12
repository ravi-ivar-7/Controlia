require('dotenv').config({ path: '.env' });
const path = require("path");
const express = require('express');
const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const jwt = require('jsonwebtoken'); 
const logger = require('./src/services/winstonLogger')
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


// BullMQ UI
const {scheduleScriptQueue} = require('./src/controllers/scheduleScripts/addEditScheduleScript')
const {mailQueue} = require('./src/services/manageMail')
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullMQAdapter(scheduleScriptQueue),new BullMQAdapter(mailQueue)],
  serverAdapter: serverAdapter,
});
app.use('/admin/queues', serverAdapter.getRouter());


// FOR USING SSL/TLS:
let options;
try {
  options = {
    key: fs.readFileSync('./config/ssl/key.pem', 'utf8'),
    cert: fs.readFileSync('./config/ssl/server.crt', 'utf8'),
  };
} catch (err) {
  logger.error(`ERROR READING SSL/TLS FILES: ${err}`);
  options = null;
}

// FOR HTTPS server
let httpsServer;
if (options) {
  httpsServer = https.createServer(options, app);

  httpsServer.listen(HTTPS_PORT, () => {
    logger.info(`HTTPS SERVER LISTENING ON ${HOST}:${HTTPS_PORT}`);
  });

  httpsServer.on('error', (err) => {
    logger.error('HTTPS SERVER ERROR:', err);
  });
} else {
  logger.error('SSL/TLS FILES NOT FOUND. HTTPS SERVER NOT STARTED.');
}

// FOR HTTP server
const httpServer = http.createServer(app);

httpServer.listen(HTTP_PORT, () => {
  logger.info(`HTTP SERVER LISTENING ON ${HOST}:${HTTP_PORT}`);
});

// WebSocket message handler
function handleWebSocketMessage(message,decodedToken, socket) {
  try {
    const parsedMessage = JSON.parse(message);
    const { route, data } = parsedMessage;
  
    if (wsRoutes[route]) {
      wsRoutes[route](data, decodedToken,socket);
    } else {
      socket.send(JSON.stringify({ warn: 'Unknown route' }));
    }
  } catch (error) {
    socket.send(JSON.stringify({ warn: 'Invalid message format', error }));
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
  logger.info('WS CONNECTED');
  socket.send(JSON.stringify({ data:'Connected...'}));
  const params = new URLSearchParams(request.url.split('?')[1]);
  const token = params.get('token');

  if (!token) {
    logger.warn('No token')
    socket.close(4001,'Token not provided');
    return;
  }

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    logger.warn('invalid deocded token')
    socket.close(4002, 'Invalid token');
    return;
  }

  socket.on('open', (message) => {
    logger.info(`open ws ${message}`);
  });

  socket.on('message', (message) => {
    handleWebSocketMessage(message, decodedToken, socket);
  });

  socket.on('close', (code, reason) => {
    logger.info(`WS CLOSED: Code = ${code}, Reason = ${reason}`);
  });

  socket.on('error', (error) => {
    logger.error(`WS ERROR: ${error}`);
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
  logger.warn(`Can't find ${req.url} on the server`);
  return res.status(404).json({ message: `Can't find ${req.url} on the server` });
});



const { Worker } = require('bullmq');
const { runScheduleScript } = require("./src/controllers/scheduleScripts/runScheduleScript");
const { sendMail } = require('./src/services/manageMail');
const IORedis = require('ioredis');

const redisOptions = {
    port: 6379, 
    host: 'singapore-redis.render.com',
    username: 'red-cq807v8gph6c73eva79g',
    password: 'zQPCwEqbsnAinoGzYKaipiJepPIajWfB', 
    tls: {}, 
    maxRetriesPerRequest: null
};

const connection = new IORedis(redisOptions);

const jobHandlers = {
    runScheduleScript,
    sendMail,
};

const processScheduleScriptJob = async (job) => {
    const handler = jobHandlers[job.name];
    if (handler) {
        logger.info(`Processing job ${job.id} in scheduleScriptQueue: ${job.name}`);
        try {
            await handler(job);
        } catch (error) {
            logger.error(`Error processing job ${job.id} in scheduleScriptQueue: ${error}`);
            throw error;
        }
    } else {
        logger.error(`No handler found for job ${job.name} in scheduleScriptQueue`);
        throw new Error(`No handler found for job ${job.name} in scheduleScriptQueue`);
    }
};

const processSendMailJob = async (job) => {
    const handler = jobHandlers[job.name];
    if (handler) {
        console.log(`Processing job ${job.id} in mailQueue: ${job.name}`);
        try {
            await handler(job);
        } catch (error) {
            logger.error(`Error processing job ${job.id} in mailQueue:`, error);
            throw error;
        }
    } else {
        logger.error(`No handler found for job ${job.name} in mailQueue`);
        throw new Error(`No handler found for job ${job.name} in mailQueue`);
    }
};

const sendMailWorker = new Worker('mailQueue',
    async (job) => {
        await processSendMailJob(job);
        logger.info(`Started mail job ${job.id}`);
    },
    {
        connection,
        concurrency: 10,
    }
);

const scheduleScriptWorker = new Worker('scheduleScriptQueue',
    async (job) => {
        await processScheduleScriptJob(job);
        logger.info(`Started schedule script job ${job.id}`);
    },
    {
        connection,
        concurrency: 10,
    }
);

scheduleScriptWorker.on("completed", (job) => {
    logger.info(`Job ${job.id} in scheduleScriptQueue has completed!`);
});

scheduleScriptWorker.on("failed", (job, err) => {
    logger.info(`Job ${job.id} in scheduleScriptQueue has failed with ${err.message}`);
});

sendMailWorker.on("completed", (job) => {
    logger.info(`Job ${job.id} in mailQueue has completed!`);
});

sendMailWorker.on("failed", (job, err) => {
    logger.info(`Job ${job.id} in mailQueue has failed with ${err.message}`);
});

logger.info("Workers started!");


