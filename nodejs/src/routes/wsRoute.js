

const { runExecuteScript } = require('../controllers/executes/runExecuteScript');

const wsRoutes = {
  '/run-execute-script': (data, decodedToken, socket) => {runExecuteScript(data,decodedToken, socket);},

};

module.exports = wsRoutes;

