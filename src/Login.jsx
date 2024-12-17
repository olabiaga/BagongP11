import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { jwtDecode } from 'jwt-decode';

import { API_ENDPOINT } from './Api';

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    
    useEffect(() => {
        const verifySession = () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    if (decoded.exp * 1000 > Date.now()) {
                        navigate('/dashboard');
                    } else {
                        localStorage.removeItem('token');
                    }
                } catch (err) {
                    console.error('Invalid token', err);
                    localStorage.removeItem('token');
                }
            }
        };

        verifySession();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!username || !password) {
            setError('Username and password are required');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_ENDPOINT}/auth/login`, {
                username,
                password,
            });

            localStorage.setItem('token', response.data.token);
            setError('');
            navigate('/dashboard');
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    setError('Invalid username or password.');
                } else if (error.response.status === 500) {
                    setError('Server error. Please try again later.');
                } else {
                    setError('An error occurred. Please try again.');
                }
            } else {
                setError('Network error. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterRedirect = () => {
        navigate('/register');
    };

    return (
        <>
            {/* Full-screen Background with Overlay */}
            <div
                style={{
                    backgroundImage: `url('data:image/jpeg;base64,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
                    // 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
                    // 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
                    // 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')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    color: '#fff',
                    fontFamily: "'Poppins', sans-serif",
                }}
            >
                {/* Overlay to darken the background */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgb(0, 0, 0)', // Dark transparent overlay
                    }}
                ></div>

                {/* Login Card */}
                <div
                    className="p-4 rounded"
                    style={{
                        backgroundColor: 'rgba(0, 20, 172, 0.85)', // Dark purple with transparency
                        boxShadow: '0 0 20px rgb(0, 0, 0)', // Pink glowing shadow
                        zIndex: 2,
                        maxWidth: '400px',
                        width: '100%',
                    }}
                >
                    {/* Logo */}
                    <div className="text-center mb-4">
                        <h3 style={{ fontWeight: 'bold', letterSpacing: '2px' }}>LOG IN</h3>
                    </div>

                    {/* Login Form */}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formUsername" className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                style={{
                                    backgroundColor: '#333',
                                    color: '#fff',
                                    border: '1px solid #777',
                                }}
                            />
                        </Form.Group>

                        <Form.Group controlId="formPassword" className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    backgroundColor: '#333',
                                    color: '#fff',
                                    border: '1px solid #777',
                                }}
                            />
                        </Form.Group>

                        {/* Error Message */}
                        {error && <p className="text-danger">{error}</p>}

                        {/* Buttons */}
                        <Button
                            variant="outline-light"
                            type="submit"
                            className="w-100 mb-3"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Log in Now'}
                        </Button>
                        <Button
                            variant="outline-secondary"
                            type="button"
                            className="w-100"
                            onClick={handleRegisterRedirect}
                        >
                            Register Account
                        </Button>
                    </Form>
                </div>
            </div>
        </>
    );
}

export default Login;
