import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import { Modal, Button } from 'react-bootstrap';
import { CDBBtn } from "cdbreact";
import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";
import "./Home.css";
import { Card } from 'react-bootstrap';
import { Link } from "react-router-dom";
import { useUser } from '../../context/UserContext';
const Home = () => {
  const { user } = useUser();
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [showPrivacyPolicies, setShowPrivacyPolicies] = useState(false);
  const [showTermsConditions, setShowTermsConditions] = useState(false);


  const content = [
    {
      title: 'Live Execute',
      subtitle: 'Instant Code Feedback',
      text: 'Write code and see live results as the server executes your code. This feature supports various languages and provides instant feedback, enabling rapid prototyping and debugging.'
    },
    {
      title: 'Schedule Scripts',
      subtitle: 'Automate Task Execution',
      text: 'All your execution scripts can be scheduled. No need to wait for long. Schedule complex tasks to run at specific times, allowing for automation and improved efficiency in your workflow.'
    },
    {
      title: 'Deploy Scripts',
      subtitle: 'Seamless Integration',
      text: 'Instant deploy of all your execute scripts. Share with friends with full control over your script. This feature ensures seamless integration and deployment across different environments.'
    },
    {
      title: 'Analytics',
      subtitle: 'Performance Insights',
      text: 'See how your deployed code is making space between people. See all your analytics on a single page. Get detailed insights into performance, usage patterns, and more to optimize your scripts.'
    },
    {
      title: 'ML/AI',
      subtitle: 'Interactive Notebooks',
      text: 'With interactive notebooks, code effortlessly, then schedule or deploy your models instantly and share with full code protection and privacy. Leverage powerful ML/AI tools to enhance your projects.'
    },
    {
      title: 'Supported Languages',
      subtitle: 'Diverse Programming Options',
      text: 'Currently, we support Javascript, Python, Bash, and C++. Expand your capabilities with support for multiple programming languages, allowing for diverse project requirements.'
    },
    {
      title: 'User Management',
      subtitle: 'Secure Access Control',
      text: 'Manage user accounts and permissions with ease. Ensure secure access control and user authentication. Implement robust user management to protect your data and manage access effectively.'
    },
    {
      title: 'Customizable Dashboards',
      subtitle: 'Tailor Your Workspace',
      text: 'Create and customize your own dashboards to monitor and manage your scripts and deployments effectively. Tailor your dashboard to fit your unique workflow and preferences.'
    },
    {
      title: 'Real-Time Collaboration',
      subtitle: 'Enhance Team Productivity',
      text: 'Collaborate with team members in real-time. Share scripts and results instantly. Enhance team productivity with real-time collaboration tools and features.'
    },
    {
      title: 'Extensive Documentation',
      subtitle: 'Comprehensive Guides',
      text: 'Access comprehensive documentation and tutorials to help you get started and make the most of all features. Benefit from detailed guides and resources to support your development journey.'
    },
    {
      title: 'Integrated Version Control',
      subtitle: 'Manage Code Changes',
      text: 'Track changes to your scripts and deployments with integrated version control. Roll back to previous versions as needed. Maintain control over your codebase with powerful versioning tools.'
    },
    {
      title: 'API Access',
      subtitle: 'Automate Workflows',
      text: 'Programmatically interact with your scripts and deployments through a robust API. Automate workflows and integrate with other tools. Extend the functionality of your projects with API access.'
    },
    {
      title: 'Cloud Integration',
      subtitle: 'Seamless Scaling',
      text: 'Easily integrate with cloud services for storage, compute, and more. Leverage the power of cloud computing in your scripts. Scale your applications seamlessly with cloud integration.'
    },
    {
      title: 'Security and Compliance',
      subtitle: 'Protect Your Data',
      text: 'Ensure your scripts and deployments meet industry standards for security and compliance. Protect your data with advanced encryption. Stay compliant with regulations and safeguard your information.'
    },
    {
      title: 'Workspace Access',
      subtitle: 'Full Control and Flexibility',
      text: 'Site supports workspace access, including access to sudo and filesystem. Enjoy full control and flexibility over your environment, enabling a more customized and secure workspace.'
    },
    {
      title: 'Preinstalled Packages/Libraries',
      subtitle: 'Ready to Use',
      text: 'Most used packages and libraries are already preinstalled, allowing you to code, execute, schedule, and deploy scripts without additional setup. Start working immediately with essential tools already in place.'
    },
    {
      title: 'Custom Installation',
      subtitle: 'Tailor Your Environment',
      text: 'Easily perform custom installations as needed. Tailor your environment to meet specific needs and preferences by adding or modifying packages and libraries beyond the preinstalled ones.'
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

            <div className="d-flex card-section" style={{ backgroundImage: 'url("img/pages/bgblack.jpg")', padding: '10px', justifyContent: 'center', alignItems: 'center', color: 'white', borderRadius: '5px' }}>
              <div className="cards-container">
                <div className="d-flex flex-column h-100 justify-content-center align-items-center">
                  <div className="mx-4 mt-3 d-flex justify-content-center align-items-center" style={{ marginBottom: '20px' }}>
                    <h2 className="m-0 h5 font-weight-bold text-white" style={{ fontSize: '2rem', textTransform: 'uppercase' }}>
                      Controlia
                    </h2>
                  </div>
                  <div className="mt-3 text-center" style={{ margin: '10px' }}>
                    <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
                      Control It All!
                    </h4>
                    <p style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                      Automate, schedule, deploy, track.
                    </p>

                    {user ? (
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '20px' }}>
                        <CDBBtn color="primary" style={{ margin: '0 10px', padding: '8px 16px' }}>
                          <Link className="popup-item" to="/profile" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            Profile
                          </Link>
                        </CDBBtn>

                        <CDBBtn color="primary" style={{ margin: '0 10px', padding: '8px 16px' }}>
                          <Link className="popup-item" to="/dashboard" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            Dashboard
                          </Link>
                        </CDBBtn>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '20px' }}>
                        <CDBBtn color="primary" style={{ margin: '0 10px', padding: '8px 16px' }}>
                          <Link className="popup-item" to="/login" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i> Login
                          </Link>
                        </CDBBtn>

                        <CDBBtn color="secondary" style={{ margin: '0 10px', padding: '8px 16px' }}>
                          <Link className="popup-item" to="/register" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            <i className="fas fa-user-plus" style={{ marginRight: '8px' }}></i> Register
                          </Link>
                        </CDBBtn>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex card-section">
              <div className="cards-container">
                <div className="d-flex card-section">
                  <div className="cards-container">
                    {content.map((info, index) => (
                      <div key={index} className="card-bg d-flex flex-column border">
                        <div className="card-content p-4 d-flex flex-column h-100">
                          <Card className="info-box h-100">
                            <Card.Body>
                              <Card.Title className='text-primary'>{info.title}</Card.Title>
                              <Card.Subtitle className="mb-2 text-info">{info.subtitle}</Card.Subtitle>
                              <Card.Text>{info.text}</Card.Text>
                            </Card.Body>
                          </Card>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>


            <div className="d-flex card-section" style={{ backgroundImage: 'url("img/pages/bgblack.jpg")', padding: '20px', justifyContent: 'center', alignItems: 'center', color: 'white', borderRadius: '5px' }}>
              <div className="cards-container">
                <div className="d-flex flex-column h-100 justify-content-center align-items-center">
                  <div className="mx-4 mt-3 d-flex justify-content-center align-items-center" style={{ marginBottom: '20px' }}>
                    <h2 className="m-0 h5 font-weight-bold text-white" style={{ fontSize: '2rem', textTransform: 'uppercase' }}>
                      Controlia
                    </h2>
                  </div>
                  <div className="mt-3 text-center" style={{ margin: '10px' }}>
                    <p style={{ fontSize: '1rem', lineHeight: '1.5', marginBottom: '20px' }}>
                      Automate, schedule, deploy, track. <br /> &copy; {new Date().getFullYear()} Controlia. All rights reserved.
                    </p>

                    <div className="footer-links" style={{ marginBottom: '20px' }}>
                      <Link onClick={() => setShowAboutUs(true)} style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}>About Us</Link>
                      <Link onClick={() => setShowTermsConditions(true)} style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}>Terms of Service</Link>
                      <Link onClick={() => setShowPrivacyPolicies(true)} style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}>Privacy Policy</Link>
                    </div>

                    <div className="footer-contact" style={{ marginBottom: '20px' }}>
                      <p style={{ margin: '0', fontSize: '1rem' }}>
                        <i className="fas fa-envelope" style={{ marginRight: '8px' }}></i>controlia.services@gmail.com
                      </p>
                      <p style={{ margin: '0', fontSize: '1rem' }}>
                        <i className="fas fa-phone" style={{ marginRight: '8px' }}></i> ...
                      </p>
                    </div>

                    <div className="footer-social" style={{ marginBottom: '20px' }}>
                      <Link to="/facebook" style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}>
                        <i className="fab fa-facebook-f"></i>
                      </Link>
                      <Link to="/twitter" style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}>
                        <i className="fab fa-twitter"></i>
                      </Link>
                      <Link to="/linkedin" style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}>
                        <i className="fab fa-linkedin-in"></i>
                      </Link>
                      <Link to="/instagram" style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}>
                        <i className="fab fa-instagram"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div>
              <Modal show={showAboutUs} onHide={() => setShowAboutUs(false)} size="lg" aria-labelledby="beta-info-modal" centered dialogClassName="dark-modal">
                <Modal.Header closeButton className="dark-modal-header" style={{ backgroundColor: '#333', color: '#fff', }}>
                  <Modal.Title id="beta-info-modal">About Us</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{  padding: '20px', backgroundColor: '#222', color: '#fff', }}
                  dangerouslySetInnerHTML={{ __html: aboutUsInfo }}
                />
                <Modal.Footer className="dark-modal-footer" style={{ backgroundColor: '#333', color: '#fff', }}>
                  <Button variant="primary" onClick={() => setShowAboutUs(false)} size="sm">
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>

            <div>
              <Modal show={showTermsConditions} onHide={() => setShowTermsConditions(false)} size="lg" aria-labelledby="beta-info-modal" centered dialogClassName="dark-modal">
                <Modal.Header closeButton className="dark-modal-header" style={{ backgroundColor: '#333', color: '#fff', }}>
                  <Modal.Title id="beta-info-modal">Terms and Conditions</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '20px', backgroundColor: '#222', color: '#fff', }}
                  dangerouslySetInnerHTML={{ __html: termsConditions }}
                />
                <Modal.Footer className="dark-modal-footer" style={{ backgroundColor: '#333', color: '#fff', }}>
                  <Button variant="primary" onClick={() => setShowTermsConditions(false)} size="sm">
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>


            <div>
              <Modal show={showPrivacyPolicies} onHide={() => setShowPrivacyPolicies(false)} size="lg" aria-labelledby="beta-info-modal" centered dialogClassName="dark-modal">
                <Modal.Header closeButton className="dark-modal-header" style={{ backgroundColor: '#333', color: '#fff', }}>
                  <Modal.Title id="beta-info-modal">Privacy Policies</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{  padding: '20px', backgroundColor: '#222', color: '#fff', }}
                  dangerouslySetInnerHTML={{ __html: privacyPolicies }}
                />
                <Modal.Footer className="dark-modal-footer" style={{ backgroundColor: '#333', color: '#fff', }}>
                  <Button variant="primary" onClick={() => setShowPrivacyPolicies(false)} size="sm">
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>



          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
const aboutUsInfo = `
<h3>Who We Are</h3>
<p>Controlia is dedicated to empowering developers and teams with a robust platform for automating, scheduling, deploying, and tracking scripts and code. Our mission is to streamline your workflow and enhance productivity through innovative features and tools.</p>

<h3>What We Offer</h3>
<p>Our platform provides a wide range of features to support your development needs:</p>
<ul>
  <li><strong>Live Execute:</strong> Write code and see live results instantly.</li>
  <li><strong>Schedule Scripts:</strong> Automate tasks by scheduling scripts to run at specific times.</li>
  <li><strong>Deploy Scripts:</strong> Seamlessly deploy scripts and share them with full control.</li>
  <li><strong>Analytics:</strong> Gain insights into the performance and usage of your deployed code.</li>
  <li><strong>ML/AI:</strong> Use interactive notebooks for effortless coding, scheduling, and deploying of ML/AI models.</li>
  <li><strong>Supported Languages:</strong> Work with Javascript, Python, Bash, and C++.</li>
  <li><strong>User Management:</strong> Securely manage user accounts and permissions.</li>
  <li><strong>Customizable Dashboards:</strong> Tailor your workspace with customizable dashboards.</li>
  <li><strong>Real-Time Collaboration:</strong> Enhance team productivity with real-time collaboration.</li>
  <li><strong>Extensive Documentation:</strong> Access comprehensive guides and tutorials.</li>
  <li><strong>Integrated Version Control:</strong> Track and manage code changes effectively.</li>
  <li><strong>API Access:</strong> Automate workflows and integrate with other tools.</li>
  <li><strong>Cloud Integration:</strong> Seamlessly scale your applications with cloud services.</li>
  <li><strong>Security and Compliance:</strong> Protect your data with advanced security measures.</li>
  <li><strong>Workspace Access:</strong> Enjoy full control and flexibility over your environment.</li>
  <li><strong>Preinstalled Packages/Libraries:</strong> Start working immediately with essential tools already in place.</li>
  <li><strong>Custom Installation:</strong> Tailor your environment to meet specific needs.</li>
</ul>
<p>We are committed to providing a secure, efficient, and user-friendly platform to help you achieve your development goals.</p>
`;

const termsConditions = `
<h3>1. Acceptance of Terms</h3>
<p>By accessing or using Controlia, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

<h3>2. Use of Services</h3>
<p>Controlia grants you a limited, non-exclusive, non-transferable license to access and use our services for personal or internal business purposes. You agree not to misuse our services, and to use them in compliance with applicable laws and regulations.</p>

<h3>3. User Accounts</h3>
<p>You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. Please notify us immediately of any unauthorized use of your account.</p>

<h3>4. Privacy</h3>
<p>Our Privacy Policy outlines how we collect, use, and protect your personal information. By using our services, you consent to our data practices as described in the Privacy Policy.</p>

<h3>5. Intellectual Property</h3>
<p>All content, trademarks, and data on Controlia are the property of Controlia or its licensors. You may not use any of these materials without our prior written permission.</p>

<h3>6. Termination</h3>
<p>We reserve the right to terminate or suspend your account at any time, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users of Controlia.</p>

<h3>7. Disclaimer of Warranties</h3>
<p>Controlia is provided "as is" without warranties of any kind. We do not guarantee that our services will be uninterrupted or error-free.</p>

<h3>8. Limitation of Liability</h3>
<p>In no event shall Controlia be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our services.</p>

<h3>9. Changes to Terms</h3>
<p>We may update these Terms of Service from time to time. Your continued use of our services constitutes your acceptance of the updated terms.</p>
`;

const privacyPolicies = `
<h3>1. Introduction</h3>
<p>This Privacy Policy describes how Controlia collects, uses, and protects your personal information when you use our services.</p>

<h3>2. Information We Collect</h3>
<ul>
  <li><strong>Personal Information:</strong> We collect information such as your name, email address, and payment details when you create an account or use our services.</li>
  <li><strong>Usage Data:</strong> We collect information about your interactions with our services, including your IP address, browser type, and activity logs.</li>
</ul>

<h3>3. How We Use Your Information</h3>
<p>We use your personal information to:</p>
<ul>
  <li>Provide, maintain, and improve our services.</li>
  <li>Process transactions and send related information.</li>
  <li>Communicate with you, including sending updates and promotional offers.</li>
  <li>Monitor and analyze usage and trends to improve user experience.</li>
</ul>

<h3>4. Sharing Your Information</h3>
<p>We do not share your personal information with third parties except:</p>
<ul>
  <li>With your consent.</li>
  <li>For processing transactions through trusted partners.</li>
  <li>To comply with legal obligations.</li>
  <li>To protect and defend our rights and property.</li>
</ul>

<h3>5. Data Security</h3>
<p>We implement industry-standard security measures to protect your personal information from unauthorized access, use, or disclosure.</p>

<h3>6. Your Rights</h3>
<p>You have the right to access, update, or delete your personal information. You can manage your account settings or contact us for assistance.</p>

<h3>7. Changes to This Policy</h3>
<p>We may update this Privacy Policy periodically. We will notify you of any significant changes and provide the updated policy on our website.</p>

<h3>8. Contact Us</h3>
<p>If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:controlia.services@gmail.com">controlia.services@gmail.com</a>.</p>
`;
