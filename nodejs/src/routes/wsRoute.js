const {wsTest} = require('../controllers/executes/wsTest')

const { runExecutionScript } = require('../controllers/executes/runExecutionScript');

const wsRoutes = {
  '/wstest': (data, decodedToken,socket) => {wsTest(data,decodedToken, socket);},
  '/run-execution-script': (data, decodedToken, socket) => {runExecutionScript(data,decodedToken, socket);},

};

module.exports = wsRoutes;

