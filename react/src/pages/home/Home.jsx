import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import Footer from '../../components/bars/Footer';
import { CDBBtn, CDBLink } from "cdbreact";
import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";
import "./Home.css";
import { Container, Row, Col, Card } from 'react-bootstrap';

const Home = () => {
  const infoBoxes = [
    {
      title: 'Live Execute',
      text: 'Write code and see live results as the server executes your code. This feature supports various languages and provides instant feedback, enabling rapid prototyping and debugging.'
    },
    {
      title: 'Schedule Scripts',
      text: 'All your execution scripts can be scheduled. No need to wait for long. Schedule complex tasks to run at specific times, allowing for automation and improved efficiency in your workflow.'
    },
    {
      title: 'Deploy Scripts',
      text: 'Instant deploy of all your execute scripts. Share with friends with full control over your script. This feature ensures seamless integration and deployment across different environments.'
    },
    {
      title: 'Analytics',
      text: 'See how your deployed code is making space between people. See all your analytics on a single page. Get detailed insights into performance, usage patterns, and more to optimize your scripts.'
    },
    {
      title: 'ML/AI',
      text: 'With interactive notebooks, code effortlessly, then schedule or deploy your models instantly and share with full code protection and privacy. Leverage powerful ML/AI tools to enhance your projects.'
    },
    {
      title: 'Supported Languages',
      text: 'Currently, we support Javascript, Python, Bash, and C++. Expand your capabilities with support for multiple programming languages, allowing for diverse project requirements.'
    },
    {
      title: 'User Management',
      text: 'Manage user accounts and permissions with ease. Ensure secure access control and user authentication. Implement robust user management to protect your data and manage access effectively.'
    },
    {
      title: 'Customizable Dashboards',
      text: 'Create and customize your own dashboards to monitor and manage your scripts and deployments effectively. Tailor your dashboard to fit your unique workflow and preferences.'
    },
    {
      title: 'Real-Time Collaboration',
      text: 'Collaborate with team members in real-time. Share scripts and results instantly. Enhance team productivity with real-time collaboration tools and features.'
    },
    {
      title: 'Extensive Documentation',
      text: 'Access comprehensive documentation and tutorials to help you get started and make the most of all features. Benefit from detailed guides and resources to support your development journey.'
    },
    {
      title: 'Integrated Version Control',
      text: 'Track changes to your scripts and deployments with integrated version control. Roll back to previous versions as needed. Maintain control over your codebase with powerful versioning tools.'
    },
    {
      title: 'API Access',
      text: 'Programmatically interact with your scripts and deployments through a robust API. Automate workflows and integrate with other tools. Extend the functionality of your projects with API access.'
    },
    {
      title: 'Cloud Integration',
      text: 'Easily integrate with cloud services for storage, compute, and more. Leverage the power of cloud computing in your scripts. Scale your applications seamlessly with cloud integration.'
    },
    {
      title: 'Security and Compliance',
      text: 'Ensure your scripts and deployments meet industry standards for security and compliance. Protect your data with advanced encryption. Stay compliant with regulations and safeguard your information.'
    }
  ];

  return (

    <div className="home d-flex">
      <div>
        <Sidebar />
      </div>
      <div style={{ flex: "1 1 auto", display: "flex", flexFlow: "column", height: "100vh", overflowY: "hidden" }}>
        <Navbar pageTitle={'Home'} />
        <div style={{ height: "100%" }}>
          <div style={{ height: "calc(100% - 64px)", overflowY: "scroll" }}>


            <div className="info">
              <Container>
                <Row className="justify-content-center">
                  {infoBoxes.map((box, index) => (
                    <Col key={index} xs={12} sm={12} md={6} lg={6} className="mb-4">
                      <Card className="info-box h-100">
                        <Card.Body>
                          <Card.Title>{box.title}</Card.Title>
                          <Card.Text>{box.text}</Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Container>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
