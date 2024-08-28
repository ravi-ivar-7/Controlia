import React, { useState, useEffect } from "react";
import { Store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';

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
      showNotification('', `Signed-in as ${user.username}`, 'info');
    } else {
      showNotification('', 'Guest', 'info');
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

            {/* home page top */}
            <div className="d-flex card-section" style={{ backgroundImage: 'url("img/pages/simplebg.webp")', padding: '10px', justifyContent: 'center', alignItems: 'center', color: 'white', borderRadius: '5px' }}>
              <div className="cards-container">
                <div className="d-flex flex-column h-100 justify-content-center align-items-center">
                  <div className="mx-4 mt-3 d-flex justify-content-center align-items-center" style={{ marginBottom: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <h1 className="m-2 font-weight-bold text-white">
                        CONTROLIA
                      </h1>
                      <div class="typing-container">
                        <h4 class="typing-animation">...Control It All</h4>
                      </div>
                    </div>
                  </div>
                  <div className=" text-center" >

                    <h3 style={{ lineHeight: '1.5' }}>
                      Build, Schedule, Automate, Deploy
                    </h3>
                    <div className="page">
                    </div>


                    {user ? (
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', marginBottom: '10px' }}>
                        <CDBBtn
                          color="success"
                          style={{
                            margin: '0 5px', // Reduced margin
                            padding: '4px 8px', // Reduced padding
                            transition: 'background-color 0.3s, transform 0.3s',
                            fontSize: '0.9rem', // Reduced font size
                          }}
                        >
                          <Link
                            className="popup-item"
                            to="/profile"
                            style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                          >
                            Profile
                          </Link>
                        </CDBBtn>

                        <CDBBtn
                          color="success"
                          style={{
                            margin: '0 5px', // Reduced margin
                            padding: '4px 8px', // Reduced padding
                            transition: 'background-color 0.3s, transform 0.3s',
                            fontSize: '0.9rem', // Reduced font size
                          }}
                        >
                          <Link
                            className="popup-item"
                            to="/dashboard"
                            style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                          >
                            Dashboard
                          </Link>
                        </CDBBtn>
                      </div>

                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <CDBBtn
                          color="success"
                          style={{
                            margin: '0 5px', // Reduced margin
                            padding: '4px 8px', // Reduced padding
                            transition: 'background-color 0.3s, transform 0.3s',
                            fontSize: '0.9rem', // Reduced font size
                          }}
                        >
                          <Link
                            className="popup-item"
                            to="/login"
                            style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                          >
                            <i className="fas fa-sign-in-alt" style={{ marginRight: '5px' }}></i> Login
                          </Link>
                        </CDBBtn>

                        <CDBBtn
                          color="success"
                          style={{
                            margin: '0 5px', // Reduced margin
                            padding: '4px 8px', // Reduced padding
                            transition: 'background-color 0.3s, transform 0.3s',
                            fontSize: '0.9rem', // Reduced font size
                          }}
                        >
                          <Link
                            className="popup-item"
                            to="/register"
                            style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                          >
                            <i className="fas fa-user-plus" style={{ marginRight: '5px' }}></i> Register
                          </Link>
                        </CDBBtn>
                      </div>

                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* workspace  */}
            <div >
              <div className="container" >
                <div className="text-box">
                  <h2 style={{ color: '#00BFFF', marginBottom: '15px' }}>Workspace: Your Cloud-Based Development Hub</h2>
                  <ul style={{
                    color: "white",
                    padding: 0,
                    margin: 0,
                    listStyleType: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    width: '100%',
                  }}>
                    <li style={{ marginBottom: "10px", width: '100%' }}>
                      🌟 <span style={{ color: "#FFD700", fontWeight: "bold" }}>Transform</span> your cloud workspace into an intuitive, local-like development hub.
                    </li>
                    <li style={{ marginBottom: "10px", width: '100%' }}>
                      💻 <span style={{ color: "#FFD700", fontWeight: "bold" }}>Code</span> as if you're working locally, with effortless scheduling and instant project deployment.
                    </li>
                    <li style={{ marginBottom: "10px", width: '100%' }}>
                      🏗️ Benefit from <span style={{ color: "#FFD700", fontWeight: "bold" }}>independent and isolated environments</span> that eliminate discrepancies.
                    </li>
                    <li style={{ marginBottom: "10px", width: '100%' }}>
                      🚀 <span style={{ color: "#FFD700", fontWeight: "bold" }}>Avoid</span> productivity loss from constant tool-switching with integrated essential tools.
                    </li>
                  </ul>


                </div>
                <div className="video-box">
                  <video
                    src="path/to/your/video.mp4"
                    controls
                    style={{
                      width: '100%',
                      height: 'auto'
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>



            <div className="card-container">
              {workspaceFeatures.map((info, index) => (
                <Card key={index} className="info-box h-100" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div
                    style={{
                      backgroundImage: `${info.imgLink}`,
                      opacity: 0.2,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      zIndex: 1,
                    }}
                  />
                  <Card.Body style={{ position: 'relative' }}>
                    <div
                      className="status-tag"
                      style={{
                        display: 'flex',
                        justifyContent: 'right',
                        marginBottom: '10px',
                      }}
                    >
                      {/* Optional status tag content */}
                    </div>
                    <Card.Title style={{ color: 'white', fontWeight: "bold" }}>{info.title}</Card.Title>
                    <Card.Text style={{ color: '#B0E0E6' }}>{info.text}</Card.Text>
                  </Card.Body>
                </Card>
              ))}
            </div>




            {/* lab  */}
            <div>
              <div className="container" >
                <div className="text-box">
                  <h2 style={{ color: '#00FFFF', marginBottom: '15px' }}>Lab: Your Cloud-Based Notebooks Lab</h2>
                  <ul style={{
                    color: "white",
                    padding: 0,
                    margin: 0,
                    listStyleType: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    width: '100%',
                  }}>
                    <li style={{ marginBottom: "10px" }}>
                      🔐 <span style={{ color: "#FFD700", fontWeight: "bold" }}>Fully-Featured </span> secure, and fast environment for seamless data analysis and visualization in the cloud.
                    </li>
                    <li style={{ marginBottom: "10px" }}>
                      🚀 <span style={{ color: "#FFD700", fontWeight: "bold" }}>Top-Notch Security </span>  and scalability, allowing you to scale resources as needed.
                    </li>
                    <li>
                      ⚡ <span style={{ color: "#FFD700", fontWeight: "bold" }}>Instant Setup</span> —no need to configure local environments. Simply launch your Jupyter Lab and start working.
                    </li>
                  </ul>


                </div>
                <div className="video-box">
                  <video
                    src="path/to/your/video.mp4"
                    controls
                    style={{
                      width: '100%',
                      height: 'auto'
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>

            <div className="d-flex card-section">
              <div className="cards-container">
                <div className="d-flex card-section">
                  <div className="cards-container">
                    {labFeatures.map((info, index) => (
                      <div key={index} className="card-bg d-flex flex-column border">
                        <Card className="info-box h-100" style={{ position: 'relative', overflow: 'hidden' }}>
                          {/* Background Image with Opacity */}
                          <div
                            style={{
                              backgroundImage: `${info.imgLink}`,
                              opacity: 0.2, // Adjust this value for desired background opacity
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              zIndex: 1,
                            }}
                          />
                          {/* Content on Top of the Background */}
                          <Card.Body style={{ position: 'relative', zIndex: 2 }}>
                            <div
                              className="status-tag"
                              style={{
                                display: 'flex',
                                justifyContent: 'right',
                                marginBottom: '10px',
                              }}
                            >
                              {info.status === 'ready' ? (
                                <span style={{ fontSize: '2rem' }}>✅</span>
                              ) : (
                                <span style={{ fontSize: '2rem' }}>🔜</span>
                              )}
                            </div>
                            <Card.Title style={{ color: 'white', zIndex: 3 }}>{info.title}</Card.Title>
                            <Card.Text style={{ color: '#B0E0E6', zIndex: 3 }}>{info.text}</Card.Text>
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* runmate */}
            <div >
              <div className="container" >
                <div className="text-box">
                  <h2 style={{ color: '#32CD32', marginBottom: "10px" }}>RunMate: Your Cloud-Based Background Worker</h2>
                  <ul style={{
                    color: "white",
                    padding: 0,
                    margin: 0,
                    listStyleType: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    width: '100%',
                  }}>
                    <li style={{ marginBottom: "10px" }}>
                      🔄 <span style={{ color: "#FFD700", fontWeight: "bold" }}>Keep your</span> projects, scripts, and notebooks running behind the scenes, while you focus on what matters most.
                    </li>
                    <li style={{ marginBottom: "10px" }}>
                      🔗 <span style={{ color: "#FFD700", fontWeight: "bold" }}>Integrate</span> RunMate with your existing workspaces, labs, or create a new environment.
                    </li>
                  </ul>



                </div>
                <div className="video-box">
                  <video
                    src="path/to/your/video.mp4"
                    controls
                    style={{
                      width: '100%',
                      height: 'auto'
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>

            <div className="d-flex card-section">
              <div className="cards-container">
                <div className="d-flex card-section">
                  <div className="cards-container">
                    {runMateFeatures.map((info, index) => (
                      <div key={index} className="card-bg d-flex flex-column border">
                        <Card className="info-box h-100" style={{ position: 'relative', overflow: 'hidden' }}>
                          {/* Background Image with Opacity */}
                          <div
                            style={{
                              backgroundImage: `${info.imgLink}`,
                              opacity: 0.2, // Adjust this value for desired background opacity
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              zIndex: 1,
                            }}
                          />
                          {/* Content on Top of the Background */}
                          <Card.Body style={{ position: 'relative', zIndex: 2 }}>
                            <div
                              className="status-tag"
                              style={{
                                display: 'flex',
                                justifyContent: 'right',
                                marginBottom: '10px',
                              }}
                            >
                              {info.status === 'ready' ? (
                                <span style={{ fontSize: '2rem' }}>✅</span>
                              ) : (
                                <span style={{ fontSize: '2rem' }}>🔜</span>
                              )}
                            </div>
                            <Card.Title style={{ color: 'white', zIndex: 3 }}>{info.title}</Card.Title>
                            <Card.Text style={{ color: '#B0E0E6', zIndex: 3 }}>{info.text}</Card.Text>
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* deployment */}
            <div >
              <div className="container">
                <div className="text-box">
                  <h2 style={{ color: 'white' }}>Effortless Deployment with Controlia</h2>
                  <ul style={{
                    color: "white",
                    padding: 0,
                    margin: 0,
                    listStyleType: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    width: '100%',
                  }}>
                    <li style={{ marginBottom: "10px" }}>
                      🚀 <span style={{ color: "#FFD700", fontWeight: "bold" }}>One-Click Deployment </span>
                      of all your projects, reducing manual steps and ensuring that your applications go live effortlessly and efficiently.
                    </li>
                    <li style={{ marginBottom: "10px" }}>
                      🛠️ <span style={{ color: "#FFD700", fontWeight: "bold" }}>Seamless Integration </span>
                      with your existing workflows effortlessly, focusing on your code while we handle the complexities of deployment.
                    </li>
                    <li style={{ marginBottom: "10px" }}>
                      ⚡ <span style={{ color: "#FFD700", fontWeight: "bold" }}>Efficient Management </span>
                      with our intuitive platform that handles the heavy lifting, allowing you to concentrate on building and improving your projects.
                    </li>
                  </ul>
                </div>
                <div className="video-box">
                  <video
                    src="path/to/deployment-video.mp4"
                    controls
                    style={{
                      width: '100%',
                      height: 'auto'
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>

            <div className="card-container">
              {deploymentFeatures.map((info, index) => (
                <Card key={index} className="info-box h-100" style={{ position: 'relative', overflow: 'hidden' }}>
                  {/* Background Image with Opacity */}
                  <div
                    style={{
                      backgroundImage: `${info.imgLink}`,
                      opacity: 0.2,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      zIndex: 1,
                    }}
                  />
                  {/* Content on Top of the Background */}
                  <Card.Body style={{ position: 'relative', zIndex: 2 }}>
                    <div
                      className="status-tag"
                      style={{
                        display: 'flex',
                        justifyContent: 'right',
                        marginBottom: '10px',
                      }}
                    >
                      {info.status === 'ready' ? (
                        <span style={{ fontSize: '2rem' }}>✅</span>
                      ) : (
                        <span style={{ fontSize: '2rem' }}>🔜</span>
                      )}
                    </div>
                    <Card.Title style={{ color: 'white' }}>{info.title}</Card.Title>
                    <Card.Text style={{ color: '#B0E0E6' }}>{info.text}</Card.Text>
                  </Card.Body>
                </Card>
              ))}
            </div>





            {/* footer */}

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

const workspaceFeatures = [
  {
    title: 'Dynamic Resource Allocation',
    text: 'Efficiently manage your resources with the ability to dynamically adjust RAM and CPU based on current needs. Continuously scale resources to match workload requirements, for optimal performance and flexibility.',
    imgLink: 'url("img/homepage/resource-allocation.png")',
    status: 'ready'
  },
  {
    title: 'Two Protected Domains for Development',
    text: 'For development needs, get two *.bycontrolia.com protected domains to test your projects over the network. Easily share these domains for feedback, iterate, and make improvements efficiently.',
    imgLink: 'url("img/homepage/protected-domains.jpeg")',
    status: 'ready'
  },
  {
    title: 'Unlimited Workspaces and Deployments',
    text: 'There are no limits on the number of workspaces, labs, or deployments you can create. As long as you have resources available in your cloud, scale up effortlessly, providing unmatched flexibility and scalability.',
    imgLink: 'url("img/homepage/unlimited nodes.jpeg")',
    status: 'ready'
  },

];



const labFeatures = [
  // {
  //   title: 'Collaborative Features',
  //   text: 'Work collaboratively with team members. Share your Jupyter Lab environment and projects, making it easy to collaborate and get feedback in real time.',
  //   imgLink: 'url("img/homepage/lab-collaborative.jpg")',
  //   status: 'ready'
  // }
];



const runMateFeatures = [

];


const deploymentFeatures = [
  {
    title: 'Automated Rollbacks',
    text: 'Easily revert to previous versions if needed. Automated rollbacks ensure that you can quickly address issues without downtime.',
    imgLink: 'url("img/homepage/deploy-oneclick.jpg")',
    status: 'inprogress'
  },

  {
    title: 'Comprehensive Analytics',
    text: 'Track and analyze performance metrics, user interactions, and deployment impact with our analytics tools. Make data-driven decisions to optimize your projects.',
    imgLink: 'url("img/homepage/analytics-comprehensive.jpeg")',
    status: 'inprogress'
  },
  {
    "title": "Robust Authentication & Customizable Security Settings",
    "text": "Secure your applications with our out-of-the-box authentication layer while customizing security settings to meet specific needs. ",
    "imgLink": "url('img/homepage/authentication-robust.webp')",
    "status": "inprogress"
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
