import React, { useEffect, useState } from 'react';
import ResponsiveGrid from '../../utils/responsiveGrid';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

const initialLayouts = {
  lg: [
    { i: 'cppserver', x: 0, y: 0, w: 6, h: 15 },
  ],
  md: [
    { i: 'cppserver', x: 0, y: 0, w: 6, h: 15 },
  ],
  sm: [
    { i: 'cppserver', x: 0, y: 0, w: 6, h: 15 },
  ],
  xs: [
    { i: 'cppserver', x: 0, y: 0, w: 6, h: 15 },
  ],
  xxs: [
    { i: 'cppserver', x: 0, y: 0, w: 6, h: 15 },
  ]
};

const inputStyle = {
  border: 'none',
  backgroundColor: 'transparent',
  color: '#fff',
  fontFamily: 'monospace',
  outline: 'none',
  width: 'calc(100% - 20px)',
  margin: '10px',

}
const outputStyle = {
  backgroundColor: '#000',
  color: '#fff',
  fontFamily: 'monospace',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}



export const CppServer = () => {
  const [ws, setWs] = useState(null);
  const [message, setMessage] = useState('execute');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = new WebSocket(process.env.REACT_APP_NODEJS_WS);

    socket.onopen = () => {
      console.log('WS CONNECTED');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message)
      setMessages(prevMessages => [...prevMessages, message.data]); // Append new message to previous messages
    };

    socket.onclose = (event) => {
      console.log(`WS DISCONNECTED: ${event.reason}`);
    };

    socket.onerror = (error) => {
      console.error('WS ERROR:', error);
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const messageToSend = JSON.stringify({ route: '/cppserver', data: message });

      ws.send(messageToSend);
      setMessage('')

    } else {
      console.error('WS IS NOT OPEN');
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>

      <ResponsiveGrid pageId="page1" initialLayouts={initialLayouts}>
        <div key="cppserver" className="grid-item">
          <Card className="text-center" style={{ width: '100%', height: '100%' }}>
            <Card.Header className="draggable-handle">CPP-Server</Card.Header>

            <Card.Body style={outputStyle}>
              <Card.Title>Output</Card.Title>
              <Card.Text>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                  ))}
                </div>
              </Card.Text>
            </Card.Body>

            <hr></hr>

            <Card.Body style={inputStyle}>
              <Card.Title>Input</Card.Title>
              <Card.Text>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter message"
                  style={{ width: '100%' }}
                />
              </Card.Text>

              <Button variant="primary" onClick={sendMessage}>Execute</Button>
            </Card.Body>

            <Card.Footer className="text-muted">.........</Card.Footer>
          </Card>
        </div>
      </ResponsiveGrid>
    </div>
  );

};

export default CppServer;
