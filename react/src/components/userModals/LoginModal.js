import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import { Store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';

import { useUser } from '../../context/UserContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const clientId = '1020802754930-t0s2jcpvq5qvltpahol8l5pjvfnga3d6.apps.googleusercontent.com';

const LoginModal = ({ isOpen: initialIsOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useUser();

  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
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
    setLoading(true);
    try {
      const response = await axiosInstance.post('/login', credentials);
      if (response.status === 200) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
        showNotification('Info', response.data.info || 'Login successful', 'success');

        const params = new URLSearchParams(location.search);
        const redirectPath = params.get('redirect') || '/';
        navigate(redirectPath);
        setIsOpen(false);
      } else {
        showNotification('Error', response.data.warn , 'danger');
      }
    } catch (err) {
      showNotification('Error', `Login error: ${err}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
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
      showNotification( 'Info', result.data.info, 'success')

    } catch (error) {
      console.error('Login failed:', error);
      showNotification('Error', 'Google Login failed.', 'danger')
    }
  };

  const onFailure = (response) => {
    console.error('Login failed:', response);
    showNotification(  'Error',' Failed goolge login response.', 'danger')
  };


  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton onClick={handleBack}>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Your Email/Username</label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="User ID or Email"
              value={credentials.username}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={handleChange}
                required
                className="form-control"
              />
              <button type="button" className="btn btn-outline-secondary" onClick={toggleShowPassword}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <Modal.Footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Link to="/register" style={{ marginBottom: '5px', textDecoration: 'none', color: '#007bff' }}>
                New? Register here
              </Link>
              <Link to="/password" style={{ textDecoration: 'none', color: '#007bff' }}>
                Forget Password?
              </Link>
            </div>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Modal.Footer>
        </form>

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

export default LoginModal;
