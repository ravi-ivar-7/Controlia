const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const wsTest = async (data, socket) => {
    // Send first message
    socket.send(JSON.stringify({ data: new Date() }));

    // Wait for 1 second
    await sleep(1000);

    // Send second message
    socket.send(JSON.stringify({ data: new Date() }));

    // Wait for 2 seconds
    await sleep(2000);

    // Send final response
    const response = { success: true, data: data };
    socket.send(JSON.stringify(response));
};

module.exports = { wsTest };
