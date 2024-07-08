import React from "react";
import ResponsiveGrid from '../../utils/responsiveGrid';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';

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



  return (
    <div style={mainStyle}>
      <h2>Dashboard</h2>

      <ResponsiveGrid pageId="page1" initialLayouts={initialLayouts}>
        <div key="a" className="grid-item">
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
                Display Input

                "@babel/plugin-proposal-private-property-in-object" package without
                declaring it in its dependencies. This is currently working because
                "@babel/plugin-proposal-private-property-in-object" is already in your
                node_modules folder for unrelated reasons, but it may break at any time.

                babel-preset-react-app is part of the create-react-app project, which
                is not maintianed anymore. It is thus unlikely that this bug will
                ever be fixed. Add "@babel/plugin-proposal-private-property-in-object" to
                your devDependencies to work around this error. This will make this message
                go away.One of your dependencies, babel-preset-react-app, is importing the
                "@babel/plugin-proposal-private-property-in-object" package without
                declaring it in its dependencies. This is currently working because
                "@babel/plugin-proposal-private-property-in-object" is already in your
                node_modules folder for unrelated reasons, but it may break at any time.

                babel-preset-react-app is part of the create-react-app project, which
                is not maintianed anymore. It is thus unlikely that this bug will
                ever be fixed. Add "@babel/plugin-proposal-private-property-in-object" to
                your devDependencies to work around this error. This will make this message

              </Card.Text>
            </Card.Body>


            <Card.Body style={{ ...bodySectionStyle1, height: '300px' }}>
              <Card.Title>Input</Card.Title>
              <Card.Text style={{ height: '100%', overflowY: 'auto', backgroundColor: '#234756' }}>
                Display Input



                "@babel/plugin-proposal-private-property-in-object" package without
                declaring it in its dependencies. This is currently working because
                "@babel/plugin-proposal-private-property-in-object" is already in your
                node_modules folder for unrelated reasons, but it may break at any time.

                babel-preset-react-app is part of the create-react-app project, which
                is not maintianed anymore. It is thus unlikely that this bug will
                ever be fixed. Add "@babel/plugin-proposal-private-property-in-object" to
                your devDependencies to work around this error. This will make this message
                go away.One of your dependencies, babel-preset-react-app, is importing the
                "@babel/plugin-proposal-private-property-in-object" package without
                declaring it in its dependencies. This is currently working because
                "@babel/plugin-proposal-private-property-in-object" is already in your
                node_modules folder for unrelated reasons, but it may break at any time.

                babel-preset-react-app is part of the create-react-app project, which
                is not maintianed anymore. It is thus unlikely that this bug will
                ever be fixed. Add "@babel/plugin-proposal-private-property-in-object" to
                your devDependencies to work around this error. This will make this message
              </Card.Text>
            </Card.Body>

            <Card.Footer className="d-flex justify-content-between" style={headerFooterStyle}>
              <Nav>
                <Button variant="info" size="sm">
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

export default Dashboard;
