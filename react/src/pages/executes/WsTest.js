import React, { useEffect, useState } from 'react';
import ResponsiveGrid from '../../utils/responsiveGrid';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';



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

const mainStyle = {
  minHeight: '100vh',
  backgroundColor: 'black',
  color: 'white',
  padding: '1rem'
};

const cardStyle = {
  backgroundColor: '#1C3334',
  color: 'white',
  marginBottom: '10px'
};

const headerFooterStyle = {
  backgroundColor: '#124E66',
  color: 'white'
};

const bodySectionStyle1 = {
  backgroundColor: '#2C3E50',
  color: 'white',
  padding: '10px',
  borderBottom: '1px solid #34495E'
};


export const WsTest = () => {
  const [ws, setWs] = useState(null);
  const [message, setMessage] = useState('');
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

    <div style={mainStyle}>
      <h2>Execution Dashboard</h2>

      <ResponsiveGrid pageId="page1" initialLayouts={initialLayouts}>
        <div key="cppserver" className="grid-item">
          <Card border="success" style={{ width: '100%', height: '100%', ...cardStyle }}>

            <Card.Header className="draggable-handle d-flex justify-content-between" style={headerFooterStyle}>
              <Nav>
                <Nav.Item>
                  <Nav.Link style={{ color: 'white' }}>Title</Nav.Link>
                </Nav.Item>
              </Nav>
              <Nav>
                <Nav.Item>
                  <Nav.Link style={{ color: 'white' }}>Language</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>

            <Card.Body style={{ ...bodySectionStyle1, height: '300px' }}>
              <Card.Title>Input</Card.Title>
              <Card.Text style={{ height: '100%', overflowY: 'auto', backgroundColor: '#234756' }}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter message"
                  style={{ width: '100%' }}
                />

              </Card.Text>
            </Card.Body>


            <Card.Body style={{ ...bodySectionStyle1, height: '300px' }}>
              <Card.Title>Input</Card.Title>
              <Card.Text style={{ height: '100%', overflowY: 'auto', backgroundColor: '#234756' }}>
                {messages.map((msg, index) => (
                  <div key={index}>{msg}</div>
                ))}
              </Card.Text>
            </Card.Body>

            <Card.Footer className="d-flex justify-content-between" style={headerFooterStyle}>
              <Nav>
                <Button variant="info" size="sm" onClick={sendMessage}>
                  <Nav.Item>
                    <Nav.Link href="" style={{ color: 'white', padding: 0 }}>Execute</Nav.Link>
                  </Nav.Item>
                </Button>
              </Nav>
              <Nav>
                <Nav>
                  <Button variant="warning" size="sm">
                    <Nav.Item>
                      <Nav.Link href="#first" style={{ color: 'white', padding: 0 }}>Edit</Nav.Link>
                    </Nav.Item>
                  </Button>
                </Nav>
                <Nav style={{ marginLeft: '10px' }}> {/* Add margin-left */}
                  <Button variant="danger" size="sm">
                    <Nav.Item>
                      <Nav.Link href="#first" style={{ color: 'white', padding: 0 }}>Delete</Nav.Link>
                    </Nav.Item>
                  </Button>
                </Nav>
              </Nav>
            </Card.Footer>


          </Card>
        </div>
      </ResponsiveGrid>
    </div>



  );

};

export default WsTest;
