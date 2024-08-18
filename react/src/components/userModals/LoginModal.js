import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import useToast from '../../hooks/useToast';
import { useUser } from '../../context/UserContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const clientId = '1020802754930-t0s2jcpvq5qvltpahol8l5pjvfnga3d6.apps.googleusercontent.com';

const LoginModal = ({ isOpen: initialIsOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [credentials, setCredentials] = useState({ userId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { showErrorToast, showSuccessToast } = useToast();
  const { setUser } = useUser();

  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
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
        showSuccessToast(response.data.info || 'Login successful');

        const params = new URLSearchParams(location.search);
        const redirectPath = params.get('redirect') || '/';
        navigate(redirectPath);
        setIsOpen(false);
      } else {
        showErrorToast(response.data.warn);
      }
    } catch (err) {
      showErrorToast(`Login error: ${err}`);
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
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="userId" className="form-label">Your Email/Username</label>
            <input
              type="text"
              name="userId"
              id="userId"
              placeholder="User ID or Email"
              value={credentials.userId}
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
