import React, { useEffect, useState, useCallback } from 'react';
import Card from 'react-bootstrap/Card';
import { Button, Nav } from 'react-bootstrap';
import AddScheduleScriptModal from '../../components/scriptModals/AddScheduleScriptModal';
import axiosInstance from '../../services/axiosInstance';
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
  const [nonScheduleScripts, setNonScheduleScripts] = useState([]);
  const [scheduleScripts, setScheduleScripts] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [layouts, setLayouts] = useState();

  const { showErrorToast, showSuccessToast } = useToast();

  
  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axiosInstance.get('/get-schedule-script', {
        headers: {
          authorization: `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        if (response.data && response.data.info) {
          showSuccessToast(response.data.info);
        }
        const { scheduleScripts, nonScheduleScripts } = response.data;
        setScheduleScripts(scheduleScripts || []);
        setNonScheduleScripts(nonScheduleScripts || []);
      } else {
        console.error('Internal Server Error:', response.data.warn);
        showErrorToast(response.data.warn || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Failed to fetch schedule scripts.', error);
      showErrorToast('Failed to fetch schedule scripts.');
    } finally {
      setLoading(false);
    }
  }, [ ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  useEffect(() => {
    if (layouts) {
      localStorage.setItem('scheduleLayouts', layouts)
    }
  }, [layouts]);

  const handleAddEditSchedule = async (scriptData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const scriptInfo = { ...scriptData, scriptId: editingSchedule.scriptId };
      const response = await axiosInstance.post('/add-edit-schedule-script', {
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
        const { scheduleScripts, nonScheduleScripts } = response.data;
        setScheduleScripts(scheduleScripts);
        setNonScheduleScripts(nonScheduleScripts)
      } else {
        console.error('Internal Server Error:', response.data.warn);
        showErrorToast(response.data.warn || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Failed to fetch schedule scripts.', error);
      showErrorToast('Failed to fetch schedule scripts.');
    } finally {
      setLoading(false);
      
    }
  }


  const handleDeleteScript = async (scriptId) => {
    if (!window.confirm(`Delete script ${scriptId}`)) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const scriptInfo = { scriptId };
      const response = await axiosInstance.post('/delete-schedule-script', {
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

        setScheduleScripts(prevScheduleScripts => prevScheduleScripts.filter(script => script.scriptId !== updatedScript.scriptId));
        setNonScheduleScripts(prevNonScheduleScripts => [...prevNonScheduleScripts, updatedScript]);

      } else {
        console.error('Internal Server Error:', response.data.warn);
        showErrorToast(response.data.warn || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Failed to fetch schedule scripts.', error);
      showErrorToast('Failed to fetch schedule scripts.');
    } finally {
      setLoading(false);
    }
  }



  const handleDragStop = useCallback((layout, oldItem, newItem, placeholder, e, element) => {
    setLayouts(layout);
  }, []);

  const handleResizeStop = useCallback((layout, oldItem, newItem, placeholder, e, element) => {
    setLayouts(layout);
  }, []);




  return (
    <div style={mainStyle}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Deploy Dashboard</h2>
        {/* <Button variant="success" size="sm" onClick={() => handleLayoutSave()}>Save Layout</Button> */}

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
        {scheduleScripts.map((script, index) => (
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
                    {script.scheduleRule ? 'Schedule: ' + script.scheduleRule : 'Not Scheduled'}
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


      <Card.Title style={{ padding: '15px', backgroundColor: 'grey' }}>Undeployed Scripts</Card.Title>

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
        {nonScheduleScripts.map((script, index) => (
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
                    {script.scheduleRule ? 'Schedule: ' + script.scheduleRule : 'Not Scheduled'}
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

              <Card.Footer className="d-flex justify-content-between" style={headerFooterStyle}>
                <div></div> {/* This empty div creates space to align content */}
                <Nav className="d-flex align-items-center">
                  <Button variant="primary" size="sm" onClick={() => { setEditingSchedule(script); setShowModal(true) }}>
                    <Nav.Item style={{ color: 'white', padding: 0 }}>Add to Deploy</Nav.Item>
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
