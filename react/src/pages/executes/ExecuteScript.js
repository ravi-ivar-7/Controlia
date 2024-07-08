import React, { useEffect, useState } from 'react';
import ResponsiveGrid from '../../utils/responsiveGrid';
import Card from 'react-bootstrap/Card';
import { Button, Nav, Form } from 'react-bootstrap';
import AddExecutionScriptModal from '../../components/modals/ExecutionModal';
import axiosInstance from '../../utils/axiosInstance';
import { v4 as uuidv4 } from 'uuid';
import useToast from '../../hooks/useToast';

const initialLayouts = {
  lg: [
    { i: 'cppserver1', x: 0, y: 0, w: 600, h: 600 }, // 50% height
    { i: 'cppserver2', x: 600, y: 0, w: 600, h: 600 }, // 50% height
  ],
  md: [
    { i: 'cppserver', x: 0, y: 0, w: 4, h: 10 },
  ],
  sm: [
    { i: 'cppserver', x: 0, y: 0, w: 6, h: 10 },
  ],
  xs: [
    { i: 'cppserver', x: 0, y: 0, w: 4, h: 10 },
  ],
  xxs: [
    { i: 'cppserver', x: 0, y: 0, w: 2, h: 24 }, // 60% height
  ],
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  rowHeight: 30,
};

const mainStyle = {
  minHeight: 'calc(100vh - 70px)', // Adjusted to accommodate fixed header
  backgroundColor: 'black',
  color: 'white',
  padding: '1rem',
  marginTop: '70px', // Adjust top margin to accommodate fixed header
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

const ExecuteScript = () => {
  const [ws, setWs] = useState(null);
  const [message, setMessage] = useState('');
  const [scriptMessages, setScriptMessages] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState([]);
  const { showToast } = useToast();
  const [connectedScriptId, setConnectedScriptId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found in local storage');
        }
        const response = await axiosInstance.post('/admin/get-execution-script', {}, {
          headers: {
            authorization: `Bearer ${token}`,
          }
        });
        const { scripts } = response.data || [];
        setScripts(scripts);
      } catch (error) {
        console.error('CAN NOT CONNECT TO EXECUTION SERVER:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWebSocketConnection = (scriptId) => {
    const token = localStorage.getItem('token');
    const socketUrl = `${process.env.REACT_APP_NODEJS_WS}?token=${token}`;
    const socket = new WebSocket(socketUrl);
    setConnectedScriptId(scriptId);

    socket.onopen = () => {
      console.log('WS CONNECTED');
      setWs(socket);
      setScriptMessages({ ...scriptMessages, [scriptId]: [] }); // Initialize message array for this script
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const newData = message.data;
      setScriptMessages(prevScriptMessages => ({
        ...prevScriptMessages,
        [scriptId]: [...(prevScriptMessages[scriptId] || []), newData]
      }));
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
  };

  const handleWebSocketMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const messageToSend = JSON.stringify({ route: '/run-execution-script', data: { message, scriptId: connectedScriptId } });
      ws.send(messageToSend);
      setMessage('');
    } else {
      console.error('WS IS NOT OPEN');
    }
  };

  const handleAddScript = async (scriptData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const scriptId = uuidv4();
      const scriptInfo = { ...scriptData, scriptId };
      const response = await axiosInstance.post('/admin/add-execution-script', {
        scriptInfo,
      }, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const { scripts } = response.data;
        setScripts(prevScripts => [...prevScripts, scripts]);
      } else {
        console.error('Error adding execution script:', response);
      }
    } catch (error) {
      console.error('CAN NOT CONNECT TO EXECUTION SERVER:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={mainStyle}>
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2>Execution Dashboard</h2>
      <Button variant="success" size="sm" onClick={() => setShowModal(true)}>Add</Button>
    </div>
      <ResponsiveGrid pageId="executionpage" initialLayouts={initialLayouts}>
        {scripts.map((script, index) => (
          <div key={`executescript-${index}`} className="grid-item">
            <Card border="success" style={{ width: '100%', height: '100%', ...cardStyle }}>
              <Card.Header className="draggable-handle d-flex justify-content-between" style={headerFooterStyle}>
                <Nav>
                  <Nav.Item>
                    <Nav.Link style={{ color: 'white' }}>{script.title}</Nav.Link>
                  </Nav.Item>
                </Nav>
        
                <Nav>
                  <Nav.Item>
                    <Nav.Link style={{ color: 'white' }}>{script.language}</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>

              <Card.Body style={{ ...bodySectionStyle1, height: '300px' }}>
                <Card.Title>Input</Card.Title>
                <Card.Text style={{ height: '100%', overflowY: 'auto', backgroundColor: '#234756' }}>
                  Script: {script.script}
                </Card.Text>
              </Card.Body>

              <Card.Body style={{ ...bodySectionStyle1, height: '300px' }}>
                <Card.Title>Output</Card.Title>
                <Card.Text style={{ height: '100%', overflowY: 'auto', backgroundColor: '#234756', whiteSpace: 'pre-wrap' }}>
                  {scriptMessages[script.scriptId]?.map((message, index) => (
                    <div key={`message-${index}`}>
                      {message}
                    </div>
                  ))}
                </Card.Text>
              </Card.Body>

              <Card.Footer className="d-flex justify-content-between" style={headerFooterStyle}>
                <Nav>
                  <Button variant="info" size="sm" onClick={() => handleWebSocketConnection(script.scriptId)}>
                    <Nav.Item>
                      <Nav.Link href="" style={{ color: 'white', padding: 0 }}>Connect</Nav.Link>
                    </Nav.Item>
                  </Button>
                </Nav>

                <Nav className="d-flex align-items-center">
                  <Button variant="warning" size="sm">
                    <Nav.Item>
                      <Nav.Link href="#first" style={{ color: 'white', padding: 0 }}>Edit</Nav.Link>
                    </Nav.Item>
                  </Button>
                  <div style={{ marginLeft: '10px' }}>
                    <Button variant="danger" size="sm">
                      <Nav.Item>
                        <Nav.Link href="#first" style={{ color: 'white', padding: 0 }}>Delete</Nav.Link>
                      </Nav.Item>
                    </Button>
                  </div>
                </Nav>
              </Card.Footer>

              <Card.Footer className="d-flex justify-content-between" style={headerFooterStyle}>
                <Nav>
                  <Form.Group controlId="messageInput" className="d-flex align-items-center">
                    <Form.Control
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter your message"
                      className='flex-grow-1 mr-2'
                    />
                    <Button variant="info" size="sm" onClick={handleWebSocketMessage} style={{ marginLeft: '10px' }}>
                      <Nav.Item>
                        <Nav.Link href="" style={{ color: 'white', padding: 0 }}>Execute</Nav.Link>
                      </Nav.Item>
                    </Button>
                  </Form.Group>
                </Nav>
              </Card.Footer>

            </Card>
          </div>
        ))}
      </ResponsiveGrid>

      {/* Modal for adding execution script */}
      <AddExecutionScriptModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSubmit={handleAddScript}
      />
    </div>
  );
};

export default ExecuteScript;
