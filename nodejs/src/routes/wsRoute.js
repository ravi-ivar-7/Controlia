const { runExecuteScript } = require('../controllers/executeScripts/runExecuteScript');

const wsRoutes = {
  '/run-execute-script': (scriptInfo, decodedToken, socket) => {runExecuteScript(scriptInfo,decodedToken, socket);},

};

module.exports = wsRoutes;

