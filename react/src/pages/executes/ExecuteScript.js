import React, { useEffect, useState, useCallback } from 'react';
import Card from 'react-bootstrap/Card';
import { Button, Nav, Form } from 'react-bootstrap';
import AddExecutionScriptModal from '../../components/modals/AddExecutionScriptModal';
import axiosInstance from '../../utils/axiosInstance';
import { v4 as uuidv4 } from 'uuid';
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
  const [scriptMessages, setScriptMessages] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState([]);
  const { showToast } = useToast();
  const [connectedScriptId, setConnectedScriptId] = useState('');
  const [editingScript, setEditingScript] = useState(null);
  const [layouts, setLayouts] = useState();

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async (token) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/get-execute-script', {}, {
        headers: {
          authorization: `Bearer ${token}`,
        }
      });
      console.log(response);
      const { scripts } = response.data || [];
      setScripts(scripts);
    } catch (error) {
      console.error('CAN NOT CONNECT TO EXECUTION SERVER:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateLayouts = useCallback((scripts) => {
    const initialLayouts = {
      lg: [],
      md: [],
      sm: [],
    };

    scripts.forEach((script, index) => {
      initialLayouts.lg.push({ i: script.scriptId, x: (index % 3) * 4, y: Math.floor(index / 3) * 4, w: 4, h: 4 });
      initialLayouts.md.push({ i: script.scriptId, x: (index % 2) * 4, y: Math.floor(index / 2) * 4, w: 4, h: 4 });
      initialLayouts.sm.push({ i: script.scriptId, x: 0, y: index, w: 1, h: 4 });
    });

    return initialLayouts;
  }, []);

  const fetchLayout = useCallback(async (token) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/get-execute-layout', {
        headers: {
          authorization: `Bearer ${token}`,
        }
      });
      console.log(response);
      const { layouts } = response.data;
      setLayouts(layouts);
      console.log('Layouts fetched:', layouts);
    } catch (error) {
      console.error('Failed to fetch layouts from API:', error);
      const storedLayouts = localStorage.getItem('executeLayouts');
      if (storedLayouts) {
        console.log('Using layouts from localStorage:', storedLayouts);
        setLayouts(JSON.parse(storedLayouts));
      } else {
        const generatedLayouts = generateLayouts(scripts);
        console.log('Generating default layouts:', generatedLayouts);
        setLayouts(generatedLayouts);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const saveLayout = useCallback(async (token, layouts) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/save-execute-layout', {
        layouts,
      }, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      showToast('Layout saved.')
    } catch (error) {
      console.error('CAN NOT CONNECT TO SERVER:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      console.error('No token found in local storage');
      return;
    }

    fetchData(token);
    fetchLayout(token);
  }, [fetchData, fetchLayout, token]);

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
      console.log('WS CONNECTED');
      setWs(socket);
      setScriptMessages({ ...scriptMessages, [scriptId]: [] });
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
      const messageToSend = JSON.stringify({ route: '/run-execute-script', data: { message, scriptId: connectedScriptId } });
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
      const response = await axiosInstance.post('/add-execute-script', {
        scriptInfo,
      }, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const { newScript } = response.data;
        console.log(newScript)
        setScripts(prevScripts => [...prevScripts, newScript]);
      } else {
        console.error('Error adding execution script:', response);
      }
    } catch (error) {
      console.error('CAN NOT CONNECT TO EXECUTION SERVER:', error);
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
        setScripts(scripts.filter(script => script.scriptId !== scriptId));
        showToast('Successfully deleted.')
      }
      else {
        console.error('Error deleting execution script:', response);
      }
    } catch (error) {
      console.error('CAN NOT CONNECT TO EXECUTION SERVER:', error);
    } finally {
      setLoading(false);
    }
  }

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
        const { updatedScript } = response.data;
        setScripts(prevScripts => prevScripts.map(script => script.scriptId === updatedScript.scriptId ? updatedScript : script));
      } else {
        console.error('Error updating execution script:', response);
      }
    } catch (error) {
      console.error('CAN NOT CONNECT TO EXECUTION SERVER:', error);
    } finally {
      setLoading(false);
      setEditingScript(null)
    }
  };

  const handleDragStop = useCallback((layout, oldItem, newItem, placeholder, e, element) => {
    setLayouts(layout);
  }, []);

  const handleResizeStop = useCallback((layout, oldItem, newItem, placeholder, e, element) => {
    setLayouts(layout);
  }, []);

  const handleLayoutSave = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No token found in local storage. Cannot save.');
      return;
    }

    if (layouts) {
      saveLayout(token, layouts);
    }
  }


  return (
    <div style={mainStyle}>
      <div className="container">
        <div className="row mb-3">
          <div className="col-12 col-lg-6 mb-2 mb-lg-0 d-flex align-items-center">
            <h4>Execution Dashboard</h4>
          </div>
          <div className="col-6 col-lg-3 d-flex justify-content-start mb-2 mb-lg-0">
            <Button variant="success" size="sm" onClick={() => setShowModal(true)}>Add</Button>
          </div>
          <div className="col-6 col-lg-3 d-flex justify-content-end">
            <Button variant="success" size="sm" onClick={handleLayoutSave}>Save Layout</Button>
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
          <div key={script.scriptId} data-grid={{ i: script.scriptId, x: (index % 3) * 4, y: Math.floor(index / 3) * 4, w: 4, h: 8}}>
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
                    value={script.argumentsList.join('\n')}
                    // onChange={(value) => setScript(value)}
                    logo={<></>}
                  />
                </Card.Text>
              </Card.Body>



              <Card.Body style={{ ...bodySectionStyle1, height: '300px', overflowY: 'auto' }}>
                <Card.Title>Output</Card.Title>
                <Card.Text style={{ height: '100%', backgroundColor: '#234756', whiteSpace: 'pre-wrap' }}>
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
