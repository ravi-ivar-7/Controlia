import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
    const { register, loading, error } = useAuth();
    const navigate = useNavigate();

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
        const { userId, email, name, password } = formData;
        if (formData.password !== formData.repeatPassword) {
            setFormData({ ...formData, passwordMatchError: 'Passwords do not match' });
            return;
        }
        // Perform validation if needed
        await register({ userId, email, name, password });
        if (!error) {
            console.log('no error in registration');
        }
    };

    const handleForgotPassword = () => {
        console.log('shortly adding this feature');
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (!isOpen) return null;

    return (
        <Modal show={isOpen} >
            <Modal.Header closeButton>
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

                    {error && <p className="text-danger">{error}</p>}

                    <Modal.Footer>
                        <div className="mr-auto">
                            <Form.Group controlId="termsChecked" className="mb-0">
                                <Form.Check
                                    type="checkbox"
                                    name="termsChecked"
                                    label="I agree to the Terms and Services"
                                    checked={formData.termsChecked}
                                    onChange={handleChange}
                                    required
                                    style={{ marginLeft: '0px' }} // Adjust the checkbox alignment
                                />
                            </Form.Group>
                        </div>

                        <div className="ml-auto">
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? 'Registering...' : 'Register'}
                            </Button>
                        </div>

                        <div className="ml-3">
                            <Button variant="secondary" onClick={handleForgotPassword}>
                                Forgot Password
                            </Button>
                            {' '}
                            <Button variant="secondary" onClick={handleBack}>
                                Back
                            </Button>
                        </div>
                    </Modal.Footer>





                </Form>
            </Modal.Body>

        </Modal>
    );
};

export default RegisterModal;
