import React, { useState } from "react";
import { Store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';

import { Modal, Button, Form } from 'react-bootstrap';
import { CDBBtn } from "cdbreact";
import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";
import "./Subscription.css";
import { Link } from "react-router-dom";
import { useUser } from '../../context/UserContext';

const Subscription = () => {
  const { user } = useUser();

  const [memory, setMemory] = useState(4); // Default 4GB
  const [cpu, setCpu] = useState(2); // Default 2 cores

  const perMemoryPrice = 5; // Price per GB
  const perCpuPrice = 10; // Price per core

  const handleMemoryChange = (e) => setMemory(e.target.value);
  const handleCpuChange = (e) => setCpu(e.target.value);

  const calculateCost = () => (memory * perMemoryPrice) + (cpu * perCpuPrice);

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

  return (
    <div className="home d-flex">
      <div>
        <Sidebar />
      </div>
      <div className="main-content">
        <Navbar pageTitle={'Subscription'} />
        <div className="content-wrapper">
          <div className="subscription-container">
            <h2>Configure Your Subscription(Test mode)</h2>
            <Form>
              <Form.Group controlId="formMemory" style={{ margin: '20px' }}>
                <Form.Label>Memory (GB)</Form.Label>
                <Form.Control
                  type="range"
                  min="1"
                  max="64"
                  value={memory}
                  onChange={handleMemoryChange}
                />
                <Form.Text style={{ color: 'white' }}>
                  {memory} GB
                </Form.Text>
              </Form.Group>
              <Form.Group controlId="formCpu" style={{ margin: '20px' }} >
                <Form.Label>CPU Cores</Form.Label>
                <Form.Control
                  type="range"
                  min="1"
                  max="16"
                  value={cpu}
                  onChange={handleCpuChange}
                />
                <Form.Text style={{ color: 'white' }}>
                  {cpu} Cores
                </Form.Text>
              </Form.Group>
              <div style={{ margin: '20px' }}>
                <h5>Estimated Cost: ${calculateCost()}</h5>
              </div>
              <div className="button-group">
                <Button
                  style={{ margin: '20px' }}
                  variant="primary"
                  onClick={() => showNotification('Subscription Updated', `Your subscription has been updated.`, 'success')}
                >
                  Confirm
                </Button>
                <Button
                  className="btn btn-secondary"
                  style={{ margin: '20px' }}
                  onClick={() => showNotification('Refund/Cancelation Policy', `Your request has been noted.`, 'info')}
                >
                  Refund/Cancelation Policy
                </Button>

              </div>

            </Form>
          </div>


          <div className="subscription-container" style={{ marginTop: '30px' }}>
            <h2>Features</h2>
            <ul>
              <li>Flexible resource allocation</li>
              <li>Scalable and customizable plans</li>
              <li>24/7 Support</li>
              <li>Advanced analytics and monitoring</li>
            </ul>
          </div>



          <div className="subscription-container" style={{ marginTop: '30px' }}>
            <h4>Enterprise Contact</h4>
            <p>If you need a customized plan or have any questions, please reach out to our enterprise team:</p>
            <p>Email: <a href="mailto:enterprise@example.com">enterprise@example.com</a></p>
            <p>Phone: <a href="tel:+123456789">+1 (234) 567-890</a></p>
          </div>




          <div className="subscription-container" style={{ marginTop: '30px' }}>
            <h4>Contact Sales</h4>
            <p>Interested in our services? Contact our sales team to get more information and a quote:</p>
            <p>Email: <a href="mailto:sales@example.com">sales@example.com</a></p>
            <p>Phone: <a href="tel:+987654321">+9 (876) 543-210</a></p>
            <Link to="/contact">
              <Button variant="outline-light">Contact Us</Button>
            </Link>
          </div>





        </div>
      </div>
    </div>
  );
}

export default Subscription;
