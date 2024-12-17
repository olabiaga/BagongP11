import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

import { API_ENDPOINT } from './Api'; // Ensure this points to your actual API endpoint

function Register() {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullname || !username || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_ENDPOINT}/auth/register`, {
        fullname,
        username,
        password,
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Failed to register. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Full-screen Background with Overlay */}
      <div
        style={{
          backgroundImage: "url('/mnt/data/image.png')", // Use your uploaded image
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontFamily: "'Poppins', sans-serif",
          color: '#fff',
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Transparent dark overlay
          }}
        ></div>

        {/* Registration Card */}
        <div
          className="p-4 rounded"
          style={{
            backgroundColor: 'rgba(20, 20, 30, 0.85)',
            boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)', // Neon glowing shadow
            zIndex: 2,
            maxWidth: '400px',
            width: '100%',
          }}
        >
          {/* Title */}
          <div className="text-center mb-4">
            <h3 style={{ fontWeight: 'bold', letterSpacing: '2px' }}>REGISTER</h3>
          </div>

          {/* Form */}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formFullname" className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Full Name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                style={{
                  backgroundColor: '#fff',
                  color: '#333',
                  border: '1px solid #777',
                }}
              />
            </Form.Group>

            <Form.Group controlId="formUsername" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  backgroundColor: '#fff',
                  color: '#333',
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
                  backgroundColor: '#fff',
                  color: '#333',
                  border: '1px solid #777',
                }}
              />
            </Form.Group>

            <Form.Group controlId="formConfirmPassword" className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  backgroundColor: '#fff',
                  color: '#333',
                  border: '1px solid #777',
                }}
              />
            </Form.Group>

            {/* Error and Success Messages */}
            {error && <p className="text-danger">{error}</p>}
            {success && <p className="text-success">{success}</p>}

            {/* Submit Button */}
            <Button
              variant="outline-light"
              type="submit"
              className="w-100 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  Registering...
                </>
              ) : (
                'Register Now'
              )}
            </Button>

            {/* Back to Login Button */}
            <Button
              variant="outline-secondary"
              type="button"
              className="w-100"
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              Back to Login
            </Button>
          </Form>
        </div>
      </div>
    </>
  );
}

export default Register;
