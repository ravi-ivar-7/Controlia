import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useToast from '../../hooks/useToast';
import axiosInstance from '../../services/axiosInstance';
import { useUser } from '../../context/UserContext';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const clientId = '1020802754930-t0s2jcpvq5qvltpahol8l5pjvfnga3d6.apps.googleusercontent.com';

const RegisterModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        userId: '',
        email: '',
        name: '',
        password: '',
        repeatPassword: '',
        termsChecked: false,
        forgotPasswordChecked: false,
        passwordMatchError: ''
    });
    const [loading, setLoading] = useState(false);
    const { showErrorToast, showSuccessToast } = useToast();
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
                showSuccessToast(response.data.info || 'Registration successful');

                const params = new URLSearchParams(location.search);
                const redirectPath = params.get('redirect') || '/';
                navigate(redirectPath);
            } else {
                showErrorToast(response.data.warn);
            }
        } catch (err) {
            showErrorToast(`Registration error: ${err}`);
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
            showSuccessToast(result.data.info)

        } catch (error) {
            console.error('Login failed:', error);
            showErrorToast('Google Login failed.')
        }
    };

    const onFailure = (response) => {
        console.error('Login failed:', response);
        showErrorToast('Failed goolge login response.')
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

                    <Form.Group controlId="userId">
                        <Form.Label>User ID</Form.Label>
                        <Form.Control
                            type="text"
                            name="userId"
                            placeholder="Enter User ID"
                            value={formData.userId}
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
