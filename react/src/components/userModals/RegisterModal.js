import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import { Store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';


import axiosInstance from '../../services/axiosInstance';
import { useUser } from '../../context/UserContext';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const clientId = '1020802754930-t0s2jcpvq5qvltpahol8l5pjvfnga3d6.apps.googleusercontent.com';

const RegisterModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        name: '',
        password: '',
        repeatPassword: '',
        termsChecked: false,
        forgotPasswordChecked: false,
        passwordMatchError: ''
    });
    const [loading, setLoading] = useState(false);
    const { setUser } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
            passwordMatchError: name === 'repeatPassword' && formData.password !== value ? 'Passwords do not match' : ''
        });
    };

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
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.repeatPassword) {
            setFormData({ ...formData, passwordMatchError: 'Passwords do not match' });
            return;
        }
        setLoading(true);
        try {
            const response = await axiosInstance.post('/register', formData);
            if (response.status === 200) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                
                showNotification( 'Info', response.data.info || 'Registration successful', 'success');

                const params = new URLSearchParams(location.search);
                const redirectPath = params.get('redirect') || '/';
                navigate(redirectPath);
            } else {
                showNotification('Error', response.data.warn, 'danger');
            }
        } catch (err) {
            showNotification( 'Error' ` Registration error: ${err}`, 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const onSuccess = async (response) => {
        try {
            const result = await axiosInstance.post('/google-auth', { response }, {
                withCredentials: true
            });
            console.log(result.data.payload);
            showNotification( 'Info', result.data.info , 'success' )

        } catch (error) {
            console.error('Login failed:', error);
            showNotification('Error', 'Google Login failed.', 'danger')
        }
    };

    const onFailure = (response) => {
        console.error('Login failed:', response);
        showNotification('Error', 'Failed goolge login response.', 'danger')
    };



    if (!isOpen) return null;

    return (
        <Modal show={isOpen} onHide={onClose}>
            <Modal.Header closeButton onClick={handleBack}>
                <Modal.Title>Register</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="username">
                        <Form.Label>User Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="username"
                            placeholder="Enter User Name"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="email">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="repeatPassword">
                        <Form.Label>Repeat Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="repeatPassword"
                            placeholder="Repeat Password"
                            value={formData.repeatPassword}
                            onChange={handleChange}
                            required
                        />
                        {formData.passwordMatchError && <p className="text-danger">{formData.passwordMatchError}</p>}
                    </Form.Group>

                    
    <Modal.Footer style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <Form.Group controlId="termsChecked" className="mb-3">
        <Form.Check
          type="checkbox"
          name="termsChecked"
          label="I agree to the Terms and Services"
          checked={formData.termsChecked}
          onChange={handleChange}
          required
          style={{ marginLeft: '0px' }}
        />
      </Form.Group>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Link to="/login" style={{ textDecoration: 'none', color: '#007bff' }}>
          Already have an account? Login here
        </Link>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </div>
    </Modal.Footer>

                </Form>

                <GoogleOAuthProvider clientId={clientId}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <GoogleLogin
                            onSuccess={onSuccess}
                            onFailure={onFailure}
                            useOneTap
                            className="google-login-button"
                        />
                    </div>
                </GoogleOAuthProvider>
            </Modal.Body>
        </Modal>
    );
};

export default RegisterModal;
