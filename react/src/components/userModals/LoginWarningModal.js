import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';

const LoginWarningModal = ({ isOpen, onClose, redirectPath }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton onClick={handleBack}>
        <Modal.Title>Login required</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Please log in to access this feature.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => navigate(`/login?redirect=${redirectPath}`)}>
          Login
        </Button>
        <Button variant="primary" onClick={() => navigate('/home')}>
          Home
        </Button>
        <Button variant="primary" onClick={() => navigate('/resources')}>
          Resources
        </Button>
        
      </Modal.Footer>
    </Modal>
  );
};

export default LoginWarningModal;
