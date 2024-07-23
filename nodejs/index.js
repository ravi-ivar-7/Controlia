require('dotenv').config({ path: '.env' });
const path = require("path");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');
const fs = require('fs');
const socketIO = require('socket.io');
const IORedis = require('ioredis');
const logger = require('./src/services/logs/winstonLogger')
const routes = require('./src/routes/apiRoutes');
const socketRoutes = require('./src/routes/socketRoutes')
const { Worker } = require('bullmq');
const {verifySocketToken} = require('./src/middlewares/verifyToken')


const HTTP_PORT = process.env.HTTP_PORT || 3001;
const HTTPS_PORT = process.env.HTTPS_PORT || 3002;
const HOST = 'localhost';

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


// FOR BULLMQ
const redisOptions = {port: 6379, host: 'singapore-redis.render.com',username: 'red-cq807v8gph6c73eva79g',password: 'zQPCwEqbsnAinoGzYKaipiJepPIajWfB', tls: {}, maxRetriesPerRequest: null};
const connection = new IORedis(redisOptions);

// FOR UI
const {scheduleScriptQueue} = require('./src/controllers/scripts/scheduleScript')
const {scheduleNotebookQueue} = require('./src/controllers/notebooks/schduleNotebook')
const {mailQueue} = require('./src/services/mail/manageMail')
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullMQAdapter(scheduleScriptQueue),new BullMQAdapter(mailQueue),new BullMQAdapter(scheduleNotebookQueue)],
  serverAdapter: serverAdapter,
});
app.use('/admin/queues', serverAdapter.getRouter());

// FOR WORKER
const { sendMail } = require('./src/services/mail/manageMail');

const {runBgCppFile} = require('./src/controllers/bgScripts/runBgCppFile')
const {runBgJavaScriptFile} = require('./src/controllers/bgScripts/runBgJavaScriptFile')
const {runBgPythonFile} = require('./src/controllers/bgScripts/runBgPythonFile')
const {runBgShellFile} = require('./src/controllers/bgScripts/runBgShellFile');

const {runBgNotebookFile} = require('./src/controllers/notebooks/runBgNotebookFile');

const jobHandlers = {
  sendMail,
  runBgCppFile, runBgJavaScriptFile, runBgPythonFile, runBgShellFile,
  runBgNotebookFile,
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

const processScheduleNotebookJob = async (job) => {
  const handler = jobHandlers[job.name];
  if (handler) {
      logger.info(`Processing job ${job.id} in scheduleNotebookQueue: ${job.name}`);
      try {
          await handler(job);
      } catch (error) {
          logger.error(`Error processing job ${job.id} in scheduleNotebookQueue: ${error}`);
          throw error;
      }
  } else {
      logger.error(`No handler found for job ${job.name} in scheduleNotebookQueue`);
      throw new Error(`No handler found for job ${job.name} in scheduleNotebookQueue`);
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

const scheduleNotebookWorker = new Worker('scheduleNotebookQueue',
  async (job) => {
      await processScheduleNotebookJob(job);
      logger.info(`Started schedule notebook job ${job.id}`);
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

scheduleNotebookWorker.on("completed", (job) => {
  logger.info(`Job ${job.id} in scheduleNotebookQueue has completed!`);
});

scheduleNotebookWorker.on("failed", (job, err) => {
  logger.info(`Job ${job.id} in scheduleNotebookQueue has failed with ${err.message}`);
});


sendMailWorker.on("completed", (job) => {
  logger.info(`Job ${job.id} in mailQueue has completed!`);
});

sendMailWorker.on("failed", (job, err) => {
  logger.info(`Job ${job.id} in mailQueue has failed with ${err.message}`);
});

logger.info("Workers started!");



// FOR HTTPS SERVER
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

// FOR HTTP SERVER
const httpServer = http.createServer(app);

httpServer.listen(HTTP_PORT, () => {
  logger.info(`HTTP SERVER LISTENING ON ${HOST}:${HTTP_PORT}`);
});

// FOR SOCKET.IO
const httpIO = socketIO(httpServer, {
  transports: ['polling', 'websocket'],
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

if (httpsServer) {
  const httpsIO = socketIO(httpsServer, {
    transports: ['polling', 'websocket'],
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });
  httpsIO.use(verifySocketToken);
  socketRoutes(httpsIO);
}

httpIO.use(verifySocketToken);
socketRoutes(httpIO);

app.use('/', routes);

app.all('*', (req, res) => {
  logger.warn(`Can't find ${req.url} on the server`);
  return res.status(404).json({ message: `Can't find ${req.url} on the server` });
});