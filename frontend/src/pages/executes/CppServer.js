import React, { useEffect, useState } from 'react';

export const CppServer = () => {
  const [ws, setWs] = useState(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001'); // Adjust URL accordingly

    socket.onopen = () => {
      console.log('WebSocket Client Connected');
      setWs(socket); // Set the WebSocket instance when connected
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message)
      setResponse(message.data);
    };

    socket.onclose = (event) => {
      console.log(`WebSocket Client Disconnected: ${event.reason}`);
    };

    socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const messageToSend = JSON.stringify({ route: '/cppserver', data: message });
      ws.send(messageToSend);
    } else {
      console.error('WebSocket is not open.');
      // Handle the case where WebSocket is not open (optional)
    }
  };

  return (
    <div>
      <h1>CppServer</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
      />
      <button onClick={sendMessage}>Send Message</button>
      <p>Response: {response}</p>
    </div>
  );
};
