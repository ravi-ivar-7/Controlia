import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginModal = ({ isOpen }) => {
  const [credentials, setCredentials] = useState({ userId: '', password: '' });
  const { login, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(credentials);
    
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!isOpen) return null;

  return (
    <Modal show={isOpen}>
      <Modal.Header closeButton>
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
          {error && <p className="text-danger">{error}</p>}
         <Modal.Footer>
      <Button variant="primary" type="submit" disabled={loading}> {loading ? 'Logging in...' : 'Login'}</Button>

        <Button variant="secondary" onClick={handleBack}>Back</Button>
      </Modal.Footer>
        </form>
      </Modal.Body>
      
    </Modal>
  );
};

export default LoginModal;
