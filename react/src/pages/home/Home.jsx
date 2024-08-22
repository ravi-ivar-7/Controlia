import React, { useState , useEffect} from "react";
import { Store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';

// import 'bootstrap/dist/css/bootstrap.min.css';
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

  const showNotification = (title, message, type) => {
    Store.addNotification({
      title: title,
      message: message,
      type: type,
      insert: "top",
      container: "top-right",
      animationIn: ["animate__animated", "animate__fadeIn"],
      animationOut: ["animate__animated", "animate__fadeOut"],
      dismiss: {
        duration: 5000,
        onScreen: true
      }
    });
  };
  

  useEffect(() => {
    if (user) {
      showNotification('Info', `Signed-in as ${user.userId}`, 'info');
    } else {
      showNotification('Info', 'Guest', 'info');
    }
  }, [user]);


  return (

    <div className="home d-flex">
      <div>
        <Sidebar />
      </div>
      <div style={{ flex: "1 1 auto", display: "flex", flexFlow: "column", height: "100vh", overflowY: "hidden" }}>
        <Navbar pageTitle={'Home'} />
        <div style={{ height: "100%" }}>
          <div style={{ height: "calc(100% - 64px)", overflowY: "scroll" }}>

            <div className="d-flex card-section" style={{ backgroundImage: 'url("img/pages/simplebg.webp")', padding: '10px', justifyContent: 'center', alignItems: 'center', color: 'white', borderRadius: '5px' }}>
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
                      Build, Schedule, Automate, Deploy
                    </p>
                    <div className="page">
                     
                    </div>
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


            <div className="d-flex card-section" style={{ backgroundImage: 'url("img/pages/codingbg.jpg")', padding: '20px', justifyContent: 'center', alignItems: 'center', color: 'white', borderRadius: '5px' }}>
              <div className="cards-container">
                <div className="d-flex flex-column h-100 justify-content-center align-items-center">
                  <div className="mx-4 mt-3 d-flex justify-content-center align-items-center" style={{ marginBottom: '20px' }}>
                    <h2 className="m-0 h5 font-weight-bold text-white" style={{ fontSize: '2rem', textTransform: 'uppercase' }}>
                      Controlia
                    </h2>
                  </div>
                  <div className="mt-3 text-center" style={{ margin: '10px' }}>
                    <p style={{ fontSize: '1rem', lineHeight: '1.5', marginBottom: '20px' }}>
                      &copy; {new Date().getFullYear()} Controlia. All rights reserved.
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
                      {/* <p style={{ margin: '0', fontSize: '1rem' }}>
                        <i className="fas fa-phone" style={{ marginRight: '8px' }}></i> ...
                      </p> */}
                    </div>

                    <div className="footer-social" style={{ marginBottom: '20px' }}>
                      {/* <Link to="/facebook" style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}>
                        <i className="fab fa-facebook-f"></i>
                      </Link> */}
                      <Link to="/twitter" style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}>
                        <i className="fab fa-twitter"></i>
                      </Link>
                      <Link to="/linkedin" style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}>
                        <i className="fab fa-linkedin-in"></i>
                      </Link>
                      {/* <Link to="/instagram" style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}>
                        <i className="fab fa-instagram"></i>
                      </Link> */}
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
                <Modal.Body style={{ padding: '20px', backgroundColor: '#222', color: '#fff', }}
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
                <Modal.Body style={{ padding: '20px', backgroundColor: '#222', color: '#fff', }}
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

const content = [
  {
    title: 'Inbuilt Code Execution Environment',
    subtitle: 'Instant Coding and Testing',
    text: 'Develop and test your scripts in real-time without any setup hassle.'
  },
  {
    title: 'Preinstalled Packages/Libraries',
    subtitle: 'Ready to Use',
    text: 'Most used packages and libraries are already preinstalled. Start working immediately with essential tools already in place.'
  },
  {
    title: 'Custom Installation',
    subtitle: 'Tailor Your Environment',
    text: 'Easily perform custom installations to meet specific needs and preferences. Add or modify packages and libraries beyond the preinstalled ones.'
  },
  {
    title: 'Schedule',
    subtitle: 'Automate Task Execution',
    text: 'All scripts and notebooks can be scheduled to run at specific times or in background. No need to wait for long processes.'
  },
  {
    title: 'Deploy',
    subtitle: 'Seamless Integration',
    text: 'Instantly deploy all your projects. With our no-code frontend development, easily integrate your projects and release them to the public.'
  },
  {
    title: 'Workspace Access',
    subtitle: 'Full Control and Flexibility',
    text: 'Get full access to the workspace, including sudo and filesystem access. Enjoy complete control and flexibility over your environment.'
  },
  {
    title: 'ML/AI',
    subtitle: 'Interactive Notebooks',
    text: 'With interactive notebooks, code effortlessly, schedule , run in background or share instantly.'
  },
  {
    title: 'Analytics',
    subtitle: 'Performance Insights',
    text: 'See how your deployed projects and shared notebooks/scripts are making an impact. Get detailed insights into performance, usage patterns, and more.'
  },
  {
    title: 'Resources',
    subtitle: 'Comprehensive Guides',
    text: 'Access comprehensive documentation and tutorials to help you get started and make the most of all features. Benefit from detailed guides and resources to support your development journey.'
  }
];


const aboutUsInfo = `
<h3>Who We Are</h3>
<p>Controlia is dedicated to empowering developers and teams with a robust platform for automating, scheduling, deploying, and tracking scripts and code. Our mission is to streamline your workflow and enhance productivity through innovative features and tools.</p>

<h3>What We Offer</h3>
<p>Our platform provides a wide range of features to support your development needs:</p>
<ul>
  <li><strong>Live Execute:</strong> Write code and see live results instantly.</li>
  <li><strong>Schedule Scripts:</strong> Automate tasks by scheduling scripts to run at specific times.</li>
  <li><strong>Deploy Projects:</strong> Seamlessly deploy projects and share them to public.</li>
  <li><strong>Analytics:</strong> Gain insights into the performance and usage of your deployed/shared code.</li>
  <li><strong>ML/AI:</strong> Use interactive notebooks for effortless coding, scheduling, and deploying of ML/AI models.</li>
  <li><strong>Supported Languages:</strong> Work with Javascript, Python, Bash, and C++.</li>
  <li><strong>Customizable Dashboards:</strong> Tailor your workspace with customizable dashboards.</li>
  <li><strong>Extensive Documentation:</strong> Access comprehensive guides and tutorials.</li>
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
<p>You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. Please notify us immediately of any unauthorized use. Misuse of the workspace, such as deleting unauthorized files or folders, may result in malfunctioning. You will be held accountable for such incidents.</p>

<h3>4. Privacy</h3>
<p>Our Privacy Policy outlines how we collect, use, and protect your personal information. By using our services, you consent to our data practices as described in the Privacy Policy.</p>

<h3>5. Intellectual Property</h3>
<p>All content, trademarks, and data on Controlia are the property of Controlia or its licensors/contriubters. You may not use any of these materials without our prior written permission.</p>

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
