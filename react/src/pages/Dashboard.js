import React from "react";
import ResponsiveGrid from '../utils/responsiveGrid';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

const initialLayouts = {
  lg: [
    { i: 'a', x: 0, y: 0, w: 4, h: 10 },
    { i: 'b', x: 4, y: 0, w: 4, h: 10 },
    { i: 'c', x: 8, y: 0, w: 4, h: 10 }
  ],
  md: [
    { i: 'a', x: 0, y: 0, w: 4, h: 10 },
    { i: 'b', x: 4, y: 0, w: 4, h: 10 },
    { i: 'c', x: 8, y: 0, w: 4, h: 10 }
  ],
  sm: [
    { i: 'a', x: 0, y: 0, w: 6, h: 10 },
    { i: 'b', x: 6, y: 0, w: 6, h: 10 },
    { i: 'c', x: 0, y: 4, w: 6, h: 10 }
  ],
  xs: [
    { i: 'a', x: 0, y: 0, w: 6, h: 10 },
    { i: 'b', x: 0, y: 4, w: 6, h: 10 },
    { i: 'c', x: 0, y: 8, w: 6, h: 10 }
  ],
  xxs: [
    { i: 'a', x: 0, y: 0, w: 2, h: 10 },
    { i: 'b', x: 0, y: 4, w: 2, h: 10 },
    { i: 'c', x: 0, y: 8, w: 2, h: 10 }
  ]
};


const Dashboard = () => {
  return (
    <div>
      <h2>Dashboard</h2>

      <ResponsiveGrid pageId="page1" initialLayouts={initialLayouts}>
        <div key="a" className="grid-item">
          <Card className="text-center" style={{ width: '100%', height: '100%' }}>
            <Card.Header className="draggable-handle">Featured</Card.Header>
            <Card.Body>
              <Card.Title>Special title treatment</Card.Title>
              <Card.Text>
                With supporting text below as a natural lead-in to additional content.
              </Card.Text>
              <Button variant="primary">Go somewhere</Button>
            </Card.Body>
            <Card.Footer className="text-muted">2 days ago</Card.Footer>
          </Card>
        </div>
        <div key="b" className="grid-item">
          <Card style={{ width: '100%', height: '100%' }}>
            <Card.Header className="draggable-handle">Card B</Card.Header>
            <Card.Body>
              <Card.Title>Card B</Card.Title>
              <Card.Text>
                Some quick example text to build on the card title and make up the bulk of the card's content.
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
        <div key="c" className="grid-item">
          <Card style={{ width: '100%', height: '100%' }}>
            <Card.Header className="draggable-handle">Card C</Card.Header>
            <Card.Body>
              <Card.Title>Card C</Card.Title>
              <Card.Text>
                Some quick example text to build on the card title and make up the bulk of the card's content.
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      </ResponsiveGrid>
    </div>
  );
};

export default Dashboard;
