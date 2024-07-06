const {wsTest} = require('../controllers/executes/wsTest')

const { cppServer } = require('../controllers/executes/cppServer');

const wsRoutes = {
  '/wstest': (data, socket) => {wsTest(data, socket);},
  '/cppserver': (data, socket) => {cppServer(data, socket);},

};

module.exports = wsRoutes;

