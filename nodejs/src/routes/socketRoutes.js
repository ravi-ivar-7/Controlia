const controller1 = require('../controllers/socket/controller1');
const controller2 = require('../controllers/socket/controller2');

const {runCppFile} = require('../controllers/scripts/runCppFile')
const {runJavaScriptFile} = require('../controllers/scripts/runJavaScriptFile')
const {runPythonFile} = require('../controllers/scripts/runPythonFile')
const {runShellFile} = require('../controllers/scripts/runShellFile')

const { jupyterServer } = require('../controllers/notebooks/startJupyterServer');


const {containerModule} = require('../controllers/containers/containerModules')
const {containerCommand} = require('../controllers/containers/containerCommand');



module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`${socket.decodedToken.userId} connected.`);
    
    // Join a private room based on the user's ID
    socket.join(socket.decodedToken.userId);

    socket.on('runCppFile', (data) =>{
      runCppFile(io, socket, data)
    })
    socket.on('runJavaScriptFile', (data) =>{
      runJavaScriptFile(io, socket, data)
    })
    socket.on('runPythonFile', (data) =>{

      runPythonFile(io, socket, data)
    })
    socket.on('runShellFile', (data) =>{
      runShellFile(io, socket, data)
    })

    socket.on('startJupyterServer', (data) =>{
      jupyterServer(io, socket, data)
    })

    socket.on('containerModule', (data) =>{
      containerModule(io, socket, data)
    })
    socket.on('containerCommand', (data) =>{
      containerCommand(io, socket, data)
    })


    
    // Handle event1
    socket.on('event1', (data) => {
      controller1.handleEvent(io, socket, data);
    });

    // Handle event2
    socket.on('event2', (data) => {
      controller2.handleEvent(io, socket, data);
    });

    socket.on('disconnect', () => {
      console.log(`${socket.decodedToken.userId} disconnected.`);
    });
  });
};