import React, { useState, useEffect, useCallback } from 'react';
import { CodeiumEditor } from "@codeium/react-code-editor";
import { Form, Button } from 'react-bootstrap';
import axiosInstance from '../../services/axiosInstance';
import useToast from '../../hooks/useToast';
import Footer from '../../components/bars/Footer';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";
import socketIOClient from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);
const ENDPOINT = 'http://localhost:3001';

const mainStyle = {
  backgroundColor: '#2C3E50',
};

const bodySectionStyle = {
  backgroundColor: '#1C3334',
  color: 'white',
};

const formFieldStyle = {
  backgroundColor: '#303030',
  color: 'white',
  margin: '5px 0',
  padding: '10px',
};

const placeholderStyle = {
  '::placeholder': {
    color: 'white',
    opacity: 0,
  }
};



const Script = () => {
  const { showErrorToast, showSuccessToast } = useToast();
  const location = useLocation();
  const { script } = location.state || {};
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    scriptName: '',
    language: '',
    scriptContent: '# Use tab to accept suggested code.',
    argumentList: []
  });

  const [errors, setErrors] = useState({});
  const [layouts, setLayouts] = useState();
  const [socketOutput, setSocketOutput] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (script) {
      setFormData({
        scriptName: script.scriptName || '',
        language: script.language || 'python',
        scriptContent: script.scriptContent || '',
        argumentList: script.argumentList || []
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.scriptName || !formData.scriptContent || !formData.language) {
        setErrors({
          ...errors,
          form: 'All fields are required.'
        });
        return;
      }

      const response = await axiosInstance.post('/save-script', { script: formData }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        if (response.data && response.data.info) {
          showSuccessToast(response.data.info);
        }
        const { script } = response.data;
        console.log(script)
        setFormData({
          scriptName: script.scriptName,
          language: script.language,
          scriptContent: script.scriptContent,
          argumentList: script.argumentList
        });
        showSuccessToast('Saved successfully...')
        
      } else {
        console.error('Internal Server Error:', response.data.warn);
        showErrorToast(response.data.warn || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Error saving script:', error);
      showErrorToast('Failed to save script. Please try again.');
    }
    finally{
      setLoading(false)
    }
  };

  const handleRunScript = () => {
    setSocketOutput([])
    const socket = socketIOClient(process.env.REACT_APP_NODEJS_API, {
      transports: ['polling', 'websocket'],
      extraHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    socket.on('data', (message) => {
      setSocketOutput((prevMessages) => [...prevMessages, message]);
    });

    socket.on('error', (message) => {
      setSocketOutput((prevMessages) => [...prevMessages, message]);
    });
    socket.on('success', (message) => {
      showSuccessToast(message.message)
      socket.disconnect();
    });
    const script = {...formData}
    if (formData.language === 'cpp') {
      socket.emit('runCppFile', { script });
    } else if (formData.language === 'python') {
      socket.emit('runPythonFile', {  script  });
    } else if (formData.language === 'javascript') {
      socket.emit('runJavaScriptFile', {  script } );
    } else if (formData.language === 'shell') {
      socket.emit('runShellFile', { script } );
    } else {
      showErrorToast('Unsupported language.');
    }

    return () => {
      socket.disconnect();
    };
  };

  useEffect(() => {
    if (layouts) {
      localStorage.setItem('executeLayouts', layouts);
    }
  }, [layouts]);

  const handleDragStop = useCallback((layout, oldItem, newItem, placeholder, e, element) => {
    setLayouts(layout);
  }, []);

  const handleResizeStop = useCallback((layout, oldItem, newItem, placeholder, e, element) => {
    setLayouts(layout);
  }, []);

  return (
    <div className="script d-flex" >
      <div>
        <Sidebar />
      </div>
      <div style={{ flex: "1 1 auto", display: "flex", flexFlow: "column", height: "100vh", overflowY: "hidden" }}>
        <Navbar pageTitle={'Script'} />
        <div style={{ height: "100%" }}>
          <div style={{ height: "calc(100% - 64px)", overflowY: "scroll" }}>

            {loading ? (<div>
              <SkeletonTheme baseColor="#202020" highlightColor="#444">
                <h1>{<Skeleton />}</h1>
                <p>
                  <Skeleton count={5} />
                </p>
              </SkeletonTheme>
            </div>) : (

              <div>


                <Form onSubmit={handleSaveSubmit} style={mainStyle}>
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
                    <div key={'maincontent'} data-grid={{ i: 'maincontent', x: 0, y: 0, w: 8, h: 8 }} style={bodySectionStyle}>
                      <div className="d-flex">
                        <Form.Group controlId="scriptName" className="flex-fill me-2" style={{ margin: '5px', height: '100%' }}>
                          <Form.Control
                            placeholder='Script Name'
                            type="text"
                            name="scriptName"
                            value={formData.scriptName}
                            onChange={handleInputChange}
                            required
                            style={{ ...formFieldStyle, ...placeholderStyle }}
                          />
                        </Form.Group>
                        <Form.Group controlId="language" className=" flex-fill" style={{ margin: '5px' }}>
                          <Form.Control
                            as="select"
                            name="language"
                            value={formData.language || 'python'}
                            onChange={handleInputChange}
                            required
                            style={formFieldStyle}
                          ><option value="python">Python</option>
                            <option value="javascript">JavaScript</option>

                            <option value="shell">Bash</option>
                            <option value="cpp">C++</option>
                          </Form.Control>
                        </Form.Group>
                        <span className='draggable-handle' style={{ cursor: 'grab', marginRight: '10px' }}>⤧</span>



                      </div>
                      <Form.Group controlId="scriptContent" style={{ margin: '5px', height: '100%' }}>
                        <Form.Label>Script Content:</Form.Label>
                        <div style={{ height: '100%' }}>
                          <CodeiumEditor
                            theme="vs-dark"
                            language={formData.language}
                            height="93%"
                            position={'relative'}
                            value={formData.scriptContent}
                            onChange={(value) => setFormData({ ...formData, scriptContent: value })}
                            defaultValue="# Welcome, use tab to accept suggested code."
                          />
                        </div>
                      </Form.Group>
                    </div>
                    <div key={'argumentList'} data-grid={{ i: 'argumentList', x: 8, y: 2, w: 4, h: 3.5 }} style={{ ...bodySectionStyle, position: 'relative' }}>
                      <Form.Group controlId="argumentList" style={{ margin: '5px', height: '100%' }}>
                        <Form.Label className='draggable-handle'>
                          Argument List (each line as a separate argument):
                        </Form.Label>
                        <div style={{ position: 'absolute', top: '5px', right: '10px' }}>
                          <span className='draggable-handle' style={{ cursor: 'grab' }}>⤧</span>
                        </div>
                        <div style={{ height: 'calc(100% - 30px)' }}>
                          <CodeiumEditor
                            theme="vs-dark"
                            value={(formData.argumentList || []).filter(line => line.trim() !== '').join('\n')}

                            onChange={(value) => {
                              const filteredArguments = value.split('\n').filter(line => line.trim() !== '');
                              setFormData({ ...formData, argumentList: filteredArguments });
                            }}
                            height="95%"
                          />
                        </div>
                      </Form.Group>
                    </div>

                    <div key={'output'} data-grid={{ i: 'output', x: 8, y: 6, w: 4, h: 3.5 }} style={bodySectionStyle}>
                      <Form.Group controlId="output" style={{ margin: '5px', height: '100%' }}>
                        <Form.Label>Output:</Form.Label>
                        <div style={{ position: 'absolute', top: '5px', right: '10px' }}>
                          <span className='draggable-handle' style={{ cursor: 'grab' }}>⤧</span>
                        </div>
                        <div style={{ height: 'calc(100% - 30px)' }}>
                          <CodeiumEditor
                            theme="vs-dark"
                            value={socketOutput.join('\n')}
                            // onChange={() => { }}
                              
                            height="95%"
                          />
                        </div>
                      </Form.Group>
                    </div>

                    <div key={'buttons'} data-grid={{ i: 'buttons', x: 8, y: 0, w: 4, h: 1 }} style={{ ...bodySectionStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ position: 'absolute', top: '5px', right: '10px' }}>
                        <span className='draggable-handle' style={{ cursor: 'grab' }}>⤧</span>
                      </div>
                      <Button type="submit" style={{ margin: '10px' }}>Save/Submit</Button>
                      <Button onClick={handleRunScript} style={{ margin: '10px' }}>Run Script</Button>
                    </div>



                  </ResponsiveGridLayout>
                </Form>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Script;
