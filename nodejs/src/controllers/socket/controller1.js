module.exports.handleEvent = (io, socket, data) => {
  console.log('Handling event1 for user:', socket.decodedToken);

  let messageCount = 0;

  const intervalId = setInterval(() => {
    if (messageCount < 5) {
      const message = `Event1 - Message ${messageCount + 1} for user ${socket.decodedToken.userId}`;
      io.to(socket.decodedToken.userId).emit('message1', message); // Emit to the user's room
      console.log(`Sent to ${socket.decodedToken.userId}: ${message}`);
      messageCount += 1;
    } else {
      clearInterval(intervalId);
    }
  }, 1000);
};
