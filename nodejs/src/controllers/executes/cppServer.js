
const cppServer = async (data, socket) => {

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
    console.log('Received data in cppServer.handleMessage:', data);

    const res1 = { step: 1, data: '3' };
    socket.send(JSON.stringify(res1));


    await sleep(1000)

    const res2 = { step: 2, data: 5434 };
    socket.send(JSON.stringify(res2));

    await sleep(2000)

    // Finally
    const response = { success: true, data: 'Processed data' }; // Example response
    console.log('Response from cppServer.handleMessage:', response);

    socket.send(JSON.stringify(response));
};

module.exports = { cppServer };
