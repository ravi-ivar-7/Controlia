import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';

const LoginWarningModal = ({ isOpen, onClose, redirectPath }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;
  
  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header>
        <Modal.Title>Login required</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Please log in to access this feature.</p>
        <p>Use Test Mode to test script execution without login.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => navigate(`/login?redirect=${redirectPath}`)}>
          Login
        </Button>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Dashboard
        </Button>
        <Button variant="secondary" onClick={() => navigate('/execute-script-test-mode')}>
          Test Mode
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LoginWarningModal;
