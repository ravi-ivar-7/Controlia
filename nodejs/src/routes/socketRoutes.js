
const { jupyterServer } = require('../controllers/workers/startJupyterServer');


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
    socket.on('containerTerminal', (data) =>{
      containerTerminal(io, socket, data)
    })

    socket.on('deployProject', (data) =>{
      deployProject(io, socket, data)
    })

    socket.on('disconnect', () => {
      console.log(`${socket.decodedToken.userId} disconnected.`);
    });
  });
};