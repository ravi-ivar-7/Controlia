import React, { useEffect, useState, useCallback } from 'react';
import Card from 'react-bootstrap/Card';
import { Button, Nav } from 'react-bootstrap';
import axiosInstance from '../../services/axiosInstance';
import useToast from '../../hooks/useToast';
import { mainStyle, headerFooterStyle, cardStyle, bodySectionStyle1 } from './AnalyticsUtils';


import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
const ResponsiveGridLayout = WidthProvider(Responsive);


const Analytics = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState([]);
  const [layouts, setLayouts] = useState();

  const { showErrorToast, showSuccessToast } = useToast();
  const token = localStorage.getItem('token');

  const fetchData = useCallback(async (token) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/get-dashboard-details', {}, {
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
      localStorage.setItem('dashboardLayouts', layouts)
    }
  }, [layouts]);




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
            <h4>Analytics</h4>
          </div>
          <div className="col-4 d-flex justify-content-end">
            <Button variant="success" size="sm" onClick={() => setShowModal(true)}>Refresh</Button>
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

        <div key='schedule' data-grid={{ i: 'schedule', x: 0, y: 0, w: 4, h: 5 }}>
          <Card border="success" style={{ width: '100%', height: '100%', ...cardStyle }}>
            <Card.Header className="draggable-handle d-flex justify-content-between" style={headerFooterStyle}>
              <Nav>
                <Nav.Item style={{ color: 'white' }}>
                  Schedule Scripts
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body style={{ ...bodySectionStyle1, height: '300px', overflowY: 'auto' }}>
              <Card.Title>Success</Card.Title>
              <Card.Text style={{ height: '100%', backgroundColor: '#234756', whiteSpace: 'pre-wrap' }}>
                <div>
                  Your totol scipts.
                </div>


              </Card.Text>
            </Card.Body>

            <Card.Footer className="d-flex justify-content-between" style={headerFooterStyle}>
              <Nav>
                <Button variant="info" size="sm" >
                  <Nav.Item style={{ color: 'white', padding: 0 }}> ...</Nav.Item>
                </Button>
              </Nav>
              <Nav>
                <Button variant="info" size="sm">
                  <Nav.Item style={{ color: 'white', padding: 0 }}>Go To Schedule</Nav.Item>
                </Button>
              </Nav>
            </Card.Footer>


          </Card>
        </div>

        <div key='execute' data-grid={{ i: 'execude', x: 4, y: 0, w: 4, h: 5 }}>
          <Card border="success" style={{ width: '100%', height: '100%', ...cardStyle }}>
            <Card.Header className="draggable-handle d-flex justify-content-between" style={headerFooterStyle}>
              <Nav>
                <Nav.Item style={{ color: 'white' }}>
                  Execute Scripts
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body style={{ ...bodySectionStyle1, height: '300px', overflowY: 'auto' }}>
              <Card.Title>Success</Card.Title>
              <Card.Text style={{ height: '100%', backgroundColor: '#234756', whiteSpace: 'pre-wrap' }}>

                <div>Your total schedule scipts</div>

              </Card.Text>
            </Card.Body>
            <Card.Body style={{ ...bodySectionStyle1, height: '300px', overflowY: 'auto' }}>
              <Card.Title>Failed</Card.Title>
              <Card.Text style={{ height: '100%', backgroundColor: '#234756', whiteSpace: 'pre-wrap' }}>

                <div>Your total schedule scipts</div>

              </Card.Text>
            </Card.Body>

            <Card.Footer className="d-flex justify-content-between" style={headerFooterStyle}>
              <Nav>
                <Button variant="info" size="sm" >
                  <Nav.Item style={{ color: 'white', padding: 0 }}> ...</Nav.Item>
                </Button>
              </Nav>
              <Nav>
                <Button variant="info" size="sm">
                  <Nav.Item style={{ color: 'white', padding: 0 }}>Go To Execute</Nav.Item>
                </Button>
              </Nav>
            </Card.Footer>


          </Card>
        </div>

        <div key='deploy' data-grid={{ i: 'deploy', x: 8, y: 0, w: 4, h: 5 }}>
          <Card border="success" style={{ width: '100%', height: '100%', ...cardStyle }}>
            <Card.Header className="draggable-handle d-flex justify-content-between" style={headerFooterStyle}>
              <Nav>
                <Nav.Item style={{ color: 'white' }}>
                  Deploy Scripts
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body style={{ ...bodySectionStyle1, height: '300px', overflowY: 'auto' }}>
              <Card.Title>Success</Card.Title>
              <Card.Text style={{ height: '100%', backgroundColor: '#234756', whiteSpace: 'pre-wrap' }}>

                <div>Your total deployed scipts</div>

              </Card.Text>
            </Card.Body>
            <Card.Body style={{ ...bodySectionStyle1, height: '300px', overflowY: 'auto' }}>
              <Card.Title>Failed</Card.Title>
              <Card.Text style={{ height: '100%', backgroundColor: '#234756', whiteSpace: 'pre-wrap' }}>

                <div>Your total deployed scipts</div>

              </Card.Text>
            </Card.Body>

            <Card.Footer className="d-flex justify-content-between" style={headerFooterStyle}>
              <Nav>
                <Button variant="info" size="sm" >
                  <Nav.Item style={{ color: 'white', padding: 0 }}> ...</Nav.Item>
                </Button>
              </Nav>
              <Nav>
                <Button variant="info" size="sm">
                  <Nav.Item style={{ color: 'white', padding: 0 }}>Go To Deploy</Nav.Item>
                </Button>
              </Nav>
            </Card.Footer>


          </Card>
        </div>




      </ResponsiveGridLayout>
    </div>
  );
};

export default Analytics;
