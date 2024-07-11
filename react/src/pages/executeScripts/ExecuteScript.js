import React, { useEffect, useState, useCallback } from 'react';
import Card from 'react-bootstrap/Card';
import { Button, Nav } from 'react-bootstrap';
import AddExecutionScriptModal from '../../components/scriptModals/AddExecuteScriptModal';
import axiosInstance from '../../services/axiosInstance';
import useToast from '../../hooks/useToast';
import { mainStyle, headerFooterStyle, cardStyle, bodySectionStyle1 } from './ExecuteScriptUtils';
import { CodeiumEditor } from "@codeium/react-code-editor";

import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
const ResponsiveGridLayout = WidthProvider(Responsive);


const ExecuteScript = () => {
  const [ws, setWs] = useState(null);
  const [message, setMessage] = useState('');
  const [socketMessages, setSocketMessages] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState([]);
  const [connectedScriptId, setConnectedScriptId] = useState('');
  const [editingScript, setEditingScript] = useState(null);
  const [layouts, setLayouts] = useState();

  const { showErrorToast, showSuccessToast } = useToast();
  const token = localStorage.getItem('token');

  const fetchData = useCallback(async (token) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/get-execute-script', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        if (response.data && response.data.info) {
          showSuccessToast(response.data.info);
        }
        setScripts(response.data.scripts || []);
      } else {
        console.error('Internal Server Error:', response.data.warn);
        showErrorToast(response.data.warn || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Failed to fetch execute scripts.', error);
      showErrorToast('Failed to fetch execute scripts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      console.error('No token found in local storage');
      showErrorToast('No token found. Failed to fetch  data.')
      return;
    }
    fetchData(token);
  }, []);

  useEffect(() => {
    if (layouts) {
      localStorage.setItem('executeLayouts', layouts)
    }
  }, [layouts]);


  const handleWebSocketConnection = (scriptId) => {
    const token = localStorage.getItem('token');
    const socketUrl = `${process.env.REACT_APP_NODEJS_WS}?token=${token}`;
    const socket = new WebSocket(socketUrl);
    setConnectedScriptId(scriptId);

    socket.onopen = () => {
      showSuccessToast('Connected')
      setWs(socket);
      setSocketMessages({ ...socketMessages, [scriptId]: [] });
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const newData = message.data;
      console.log(message.message)
      setSocketMessages(prevSocketMessages => ({ ...prevSocketMessages, [scriptId]: [...(prevSocketMessages[scriptId] || []), newData] }));
    };

    socket.onclose = (event) => {
      showErrorToast('Disconnected')
      console.log(`WS DISCONNECTED: ${event.reason}`);
    };

    socket.onerror = (error) => {
      showErrorToast('Connection error.')
      console.error('WS ERROR:', error);
    };

    return () => {
      socket.close();
    };
  };

  const handleWebSocketMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const messageToSend = JSON.stringify({ route: '/run-execute-script', data: { message, scriptId: connectedScriptId } });
      ws.send(messageToSend);
      setMessage('');
    } else {
      showErrorToast('Connection is not open.')
      console.error('WS IS NOT OPEN');
    }
  };

  const handleAddScript = async (scriptData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const scriptInfo = { ...scriptData };
      const response = await axiosInstance.post('/add-execute-script', {
        scriptInfo,
      }, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      console.log(response.status)
      if (response.status === 200) {
        if (response.data && response.data.info) {
          showSuccessToast(response.data.info);
        }
        const { newScript } = response.data;
        setScripts(prevScripts => [...prevScripts, newScript]);
      }
      else {
        console.error('Internal Server Error', response.data.warn);
        showErrorToast(response.data.warn || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Failed to add new execute scripts.', error);
      showErrorToast('Failed to add new execute scripts.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScript = async (scriptId) => {
    if (!window.confirm(`Delete script ${scriptId}`)) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const scriptInfo = { scriptId };
      console.log('executed')
      const response = await axiosInstance.post('/delete-execute-script', {
        scriptInfo,
      }, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        if (response.data && response.data.info) {
          showSuccessToast(response.data.info);
        }
        setScripts(prevScripts => prevScripts.filter(script => script.scriptId !== scriptInfo.scriptId));
      } else {
        console.error('Internal Server Error:', response.data.warn);
        showErrorToast(response.data.warn || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Failed to delete execute scripts.', error);
      showErrorToast('Failed to delete execute scripts.');
    } finally {
      setLoading(false);
     
    }
  };

  const handleEditScript = async (scriptData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const scriptInfo = { ...scriptData, scriptId: editingScript.scriptId };
      const response = await axiosInstance.post('/edit-execute-script', {
        scriptInfo,
      }, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        if (response.data && response.data.info) {
          showSuccessToast(response.data.info);
        }
        const { updatedScript } = response.data;
        setScripts(prevScripts => prevScripts.map(script => script.scriptId === updatedScript.scriptId ? updatedScript : script));
      }
      else {
        console.error('Internal Server Error:', response.data.warn);
        showErrorToast(response.data.warn || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Failed to edit execute scripts.', error);
      showErrorToast('Failed to edit execute scripts.');
    } finally {
      setLoading(false);
      setEditingScript('')
    }
  };

  const handleDragStop = useCallback((layout, oldItem, newItem, placeholder, e, element) => {
    setLayouts(layout);
  }, []);

  const handleResizeStop = useCallback((layout, oldItem, newItem, placeholder, e, element) => {
    setLayouts(layout);
  }, []);

  return (
    <div style={mainStyle}>
      <div className="container">
        <div className="row mb-3">
          <div className="col-8 d-flex align-items-center">
            <h4>Execution Dashboard</h4>
          </div>
          <div className="col-4 d-flex justify-content-end">
            <Button variant="success" size="sm" onClick={() => setShowModal(true)}>Add</Button>
          </div>
        </div>
      </div>


      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 8, sm: 1 }}
        rowHeight={100}
        draggableHandle=".draggable-handle"
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
      >
        {scripts.map((script, index) => (
          <div key={script.scriptId} data-grid={{ i: script.scriptId, x: (index % 3) * 4, y: Math.floor(index / 3) * 4, w: 4, h: 8 }}>
            <Card border="success" style={{ width: '100%', height: '100%', ...cardStyle }}>
              <Card.Header className="draggable-handle d-flex justify-content-between" style={headerFooterStyle}>
                <Nav>
                  <Nav.Item style={{ color: 'white' }}>
                    {script.title}
                  </Nav.Item>
                </Nav>

                <Nav>
                  <Nav.Item style={{ color: 'white' }}>
                    {script.language}
                  </Nav.Item>
                </Nav>
              </Card.Header>

              <Card.Body style={{ ...bodySectionStyle1, height: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                <Card.Title >Script</Card.Title>
                <Card.Text style={{ height: '100%', backgroundColor: '#234756', whiteSpace: 'pre-wrap' }}>
                  <CodeiumEditor
                    language={script.language}
                    theme="vs-dark"
                    value={script.script}
                    // onChange={(value) => setScript(value)}
                    logo={<></>}
                  />
                </Card.Text>
              </Card.Body>

              <Card.Body style={{ ...bodySectionStyle1, height: '300px', overflowY: 'auto' }}>
                <Card.Title>Arguments</Card.Title>
                <Card.Text style={{ height: '100%', backgroundColor: '#234756', whiteSpace: 'pre-wrap' }}>
                  <CodeiumEditor
                    language='text'
                    theme="vs-dark"
                    value={(script.argumentsList || []).join('\n')}
                    // onChange={(value) => setScript(value)}
                    logo={<></>}
                  />
                </Card.Text>
              </Card.Body>



              <Card.Body style={{ ...bodySectionStyle1, height: '300px', overflowY: 'auto' }}>
                <Card.Title>Output</Card.Title>
                <Card.Text style={{ height: '100%', backgroundColor: '#234756', whiteSpace: 'pre-wrap' }}>
                  {socketMessages[script.scriptId]?.map((message, index) => (
                    <div key={`socket-message-${index}`}>
                      {message}
                    </div>
                  ))}
                </Card.Text>
              </Card.Body>

              <Card.Footer className="d-flex justify-content-between" style={headerFooterStyle}>
                <Nav>
                  <Button variant="info" size="sm" onClick={() => handleWebSocketConnection(script.scriptId)}>
                    <Nav.Item style={{ color: 'white', padding: 0 }}> Connect</Nav.Item>
                  </Button>
                </Nav>
                <Nav>
                  <Button variant="info" size="sm" onClick={handleWebSocketMessage}>
                    <Nav.Item style={{ color: 'white', padding: 0 }}>Execute</Nav.Item>
                  </Button>
                </Nav>
              </Card.Footer>
              <Card.Footer className="d-flex justify-content-between" style={headerFooterStyle}>
                <Nav className="d-flex align-items-center">
                  <Button variant="danger" size="sm" onClick={() => handleDeleteScript(script.scriptId)}>
                    <Nav.Item style={{ color: 'white', padding: 0 }}>Delete</Nav.Item>
                  </Button>
                </Nav>
                <Nav>
                  <Button variant="primary" size="sm" onClick={() => { setEditingScript(script); setShowModal(true) }}>
                    <Nav.Item style={{ color: 'white', padding: 0 }}>Edit</Nav.Item>
                  </Button>
                </Nav>
              </Card.Footer>

            </Card>
          </div>
        ))}

      </ResponsiveGridLayout>

      <AddExecutionScriptModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSubmit={editingScript ? handleEditScript : handleAddScript}
        initialTitle={editingScript ? editingScript.title : ''}
        initialLanguage={editingScript ? editingScript.language : ''}
        initialScript={editingScript ? editingScript.script : ''}
        initialArgumentsList={editingScript ? editingScript.argumentsList : []}
      />

    </div>
  );
};

export default ExecuteScript;
