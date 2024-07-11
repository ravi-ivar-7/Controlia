import React, { useEffect, useState, useCallback } from 'react';
import Card from 'react-bootstrap/Card';
import { Button, Nav, Form } from 'react-bootstrap';
import AddDeployScriptModal from '../../components/modals/AddDeployScriptModal';
import axiosInstance from '../../utils/axiosInstance';
import { v4 as uuidv4 } from 'uuid';
import useToast from '../../hooks/useToast';
import { mainStyle, headerFooterStyle, cardStyle, bodySectionStyle1 } from './DeployScriptUtils';
import { CodeiumEditor } from "@codeium/react-code-editor";

import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
const ResponsiveGridLayout = WidthProvider(Responsive);


const DeployScript = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState([]);
  const [executeScripts, setExecuteScripts] = useState([]);
  const [deployScripts, setDeployScripts] = useState([]);
  const [editingDeploy, setEditingDeploy] = useState(null);
  const [layouts, setLayouts] = useState();
  const { showToast } = useToast();

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async (token) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/get-execute-script', {}, {
        headers: {
          authorization: `Bearer ${token}`,
        }
      });

      const { scripts } = response.data || [];
      setScripts(scripts)
      setExecuteScripts(scripts.filter(script => script.deployId === ''));
      setDeployScripts(scripts.filter(script => script.deployId !== ''));

    } catch (error) {
      console.error('CAN NOT CONNECT TO DEPLOY/EXECUTE SERVER:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddEditDeploy = async (scriptData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const scriptInfo = { ...scriptData, scriptId: editingDeploy.scriptId };
      const response = await axiosInstance.post('/add-edit-deploy-script', {
        scriptInfo,
      }, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data)
      if (response.status === 200) {
        const { scripts } = response.data || [];
        setScripts(scripts)
        setExecuteScripts(scripts.filter(script => script.deployId === ''));
        setDeployScripts(scripts.filter(script => script.deployId !== ''));

      } else {
        console.error('Error adding /updating deploy script:', response);
      }
    } catch (error) {
      console.error('CAN NOT CONNECT TO DEPLOY SERVER:', error);
    } finally {
      setLoading(false);
      setEditingDeploy(null)
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
      const response = await axiosInstance.post('/delete-deploy-script', {
        scriptInfo,
      }, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        if (response.status === 200) {
          const { scripts } = response.data || [];
          setScripts(scripts)
          setExecuteScripts(scripts.filter(script => script.deployId === ''));
          setDeployScripts(scripts.filter(script => script.deployId !== ''));
          showToast('Successfully deleted.')

        }
        else {
          console.error('Error deleting deploy script:', response);
        }
      }
    } catch (error) {
      console.error('CAN NOT CONNECT TO DEPLOY SERVER:', error);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    fetchData(token);
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
      const response = await axiosInstance.get('/get-deploy-layout', {
        headers: {
          authorization: `Bearer ${token}`,
        }
      });
      const { layouts } = response.data;
      setLayouts(layouts);
      console.log('Layouts fetched:', layouts);
    } catch (error) {
      console.error('Failed to fetch layouts from API:', error);
      const storedLayouts = localStorage.getItem('deployLayouts');
      if (storedLayouts) {
        console.log('Using layouts from localStorage:', storedLayouts);
        setLayouts(JSON.parse(storedLayouts));
      } else {
        const generatedLayouts = generateLayouts(executeScripts.concat(deployScripts));
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
      const response = await axiosInstance.post('/save-schedule-layout', {
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
      localStorage.setItem('deployLayouts', layouts)
    }
  }, [layouts]);


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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Deploy Dashboard</h2>
        <Button variant="success" size="sm" onClick={() => handleLayoutSave()}>Save Layout</Button>

      </div>

      <Card.Title style={{ padding: '15px', backgroundColor: 'grey' }}>Deployed Scripts</Card.Title>

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
        {deployScripts.map((script, index) => (
          <div key={script.scriptId} data-grid={{ i: script.scriptId, x: (index % 3) * 4, y: Math.floor(index / 3) * 4, w: 4, h: 5 }}>
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
              <Card.Header className="draggable-handle d-flex justify-content-between" style={headerFooterStyle}>
                {/* <Nav>
                  <Nav.Item style={{ color: 'white' }}>
                    {script.scriptId}
                  </Nav.Item>
                </Nav> */}

                <Nav>
                  <Nav.Item style={{ color: 'white' }}>
                    {script.schedule ? 'Schedule: ' + script.schedule : 'Not Scheduled'}
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


              <Card.Footer className="d-flex justify-content-between" style={headerFooterStyle}>
                <Nav className="d-flex align-items-center">
                  <Button variant="danger" size="sm" onClick={() => handleDeleteScript(script.scriptId)}>
                    <Nav.Item style={{ color: 'white', padding: 0 }}>Delete</Nav.Item>
                  </Button>
                </Nav>
                <Nav className="d-flex align-items-center">
                  <Button variant="primary" size="sm" onClick={() => { setEditingSchedule(script); setShowModal(true) }}>
                    <Nav.Item style={{ color: 'white', padding: 0 }}>Edit</Nav.Item>
                  </Button>
                </Nav>
              </Card.Footer>

            </Card>
          </div>
        ))}

      </ResponsiveGridLayout>


      <Card.Title style={{ padding: '15px', backgroundColor: 'grey' }}>Unscheduled Scripts</Card.Title>

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
        {executeScripts.map((script, index) => (
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
              <Card.Header className="draggable-handle d-flex justify-content-between" style={headerFooterStyle}>
                {/* <Nav>
                  <Nav.Item style={{ color: 'white' }}>
                    {script.scriptId}
                  </Nav.Item>
                </Nav> */}

                <Nav>
                  <Nav.Item style={{ color: 'white' }}>
                    {script.schedule ? 'Schedule: ' + script.schedule : 'Not Scheduled'}
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

              <Card.Footer className="d-flex justify-content-between" style={headerFooterStyle}>
                <div></div> {/* This empty div creates space to align content */}
                <Nav className="d-flex align-items-center">
                  <Button variant="primary" size="sm" onClick={() => { setEditingSchedule(script); setShowModal(true) }}>
                    <Nav.Item style={{ color: 'white', padding: 0 }}>Add to Schedule</Nav.Item>
                  </Button>
                </Nav>
              </Card.Footer>

            </Card>
          </div>
        ))}

      </ResponsiveGridLayout>


      <AddScheduleScriptModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSubmit={handleAddEditSchedule}
        scriptData={editingSchedule ? editingSchedule : ''}
      />

    </div>
  );
};

export default DeployScript;
