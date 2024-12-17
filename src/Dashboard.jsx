import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import {jwtDecode} from 'jwt-decode';
import Swal from 'sweetalert2';
import Modal from 'react-bootstrap/Modal';

import { API_ENDPOINT } from './Api';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [showRead, setShowRead] = useState(false);
    const [fullname, setFullname] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    const navigate = useNavigate();

    const getToken = () => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) return null;

        try {
            const parsed = JSON.parse(storedToken);
            return parsed?.data?.token || parsed.token || storedToken;
        } catch {
            return storedToken;
        }
    };

    useEffect(() => {
        const fetchDecodedUserID = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No token found');

                const decodedToken = jwtDecode(token);
                setUser(decodedToken);
            } catch (error) {
                console.error('Error decoding token:', error);
                navigate("/login");
            }
        };

        fetchDecodedUserID();
    }, [navigate]);

    const getHeaders = () => {
        const token = getToken();
        return token ? { accept: 'application/json', Authorization: token } : { accept: 'application/json' };
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await axios.get(`${API_ENDPOINT}/user`, { headers: getHeaders() });
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleLogout = () => {
        try {
            localStorage.removeItem('token');
            navigate("/login");
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const deleteUser = async (user_id) => {
        const isConfirm = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#9CBBFC',
            cancelButtonColor: '#9CBBFC',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => result.isConfirmed);

        if (!isConfirm) return;

        try {
            const headers = getHeaders();
            await axios.delete(`${API_ENDPOINT}/user/${user_id}`, { headers });

            Swal.fire({
                icon: "success",
                text: "Successfully Deleted"
            });

            setUsers(users.filter(user => user.user_id !== user_id));
        } catch (error) {
            const errorMessage = error.response
                ? error.response.data?.message || 'Failed to delete user. Please try again.'
                : error.message || 'An unexpected error occurred.';

            Swal.fire({
                text: errorMessage,
                icon: "error"
            });
        }
    };

    const createUser = async (e) => {
        e.preventDefault();

        if (!fullname || !username || !password) {
            Swal.fire({
                icon: "warning",
                text: "All fields are required."
            });
            return;
        }

        try {
            const { data } = await axios.post(`${API_ENDPOINT}/user`, {
                fullname,
                username,
                password
            }, { headers: getHeaders() });

            Swal.fire({
                icon: "success",
                text: data.message
            });

            setFullname("");
            setUsername("");
            setPassword("");
            setUsers([...users, data.newUser]);
            setShowCreate(false);
        } catch (error) {
            const errorMessage = error.response
                ? error.response.data?.message || 'Failed to create user. Please try again.'
                : error.message || 'An unexpected error occurred.';

            Swal.fire({
                text: errorMessage,
                icon: "error"
            });
        }
    };

    const updateUser = async (e) => {
        e.preventDefault();

        if (!fullname || !username) {
            Swal.fire({
                icon: "warning",
                text: "Fullname and Username are required."
            });
            return;
        }

        try {
            const { data } = await axios.put(`${API_ENDPOINT}/user/${selectedUser.user_id}`, {
                fullname,
                username,
                password: password || undefined
            }, { headers: getHeaders() });

            Swal.fire({
                icon: "success",
                text: "User successfully updated."
            });

            setUsers(users.map(user => user.user_id === selectedUser.user_id ? data.updatedUser : user));
            setShowUpdate(false);
        } catch (error) {
            const errorMessage = error.response
                ? error.response.data?.message || 'Failed to update user. Please try again.'
                : error.message || 'An unexpected error occurred.';

            Swal.fire({
                text: errorMessage,
                icon: "error"
            });
        }
    };

    const handleShowUpdate = (row_users) => {
        setSelectedUser(row_users);
        setFullname(row_users.fullname);
        setUsername(row_users.username);
        setPassword("");
        setShowUpdate(true);
    };

    const handleShowRead = (row_users) => {
        setSelectedUser(row_users);
        setShowRead(true);
    };

    return (
        <>
            <Navbar bg="success" data-bs-theme="dark">
                <Container>
                    <Navbar.Brand href="#home">Computer Shop</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="#users">Users</Nav.Link>
                        <Nav.Link href="#departments">Top Up Center</Nav.Link>
                        <Nav.Link href="#courses">DownLoad</Nav.Link>
                    </Nav>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <NavDropdown title={user ? user.username : 'Dropdown'} id="basic-nav-dropdown" align="end">
                                <NavDropdown.Item href="#">Profile</NavDropdown.Item>
                                <NavDropdown.Item href="#">Settings</NavDropdown.Item>
                                <NavDropdown.Item href="#" onClick={handleLogout}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <br />

            <div className='container'>
                <div className='col-12'>
                    <Button variant="btn btn-success mb-2 float-end btn-sm me-2" onClick={() => setShowCreate(true)}>Create User</Button>
                </div>

                <table className='table table-bordered'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Fullname</th>
                            <th><center>Action</center></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 && users.map((row_users) => (
                            <tr key={row_users.user_id}>
                                <td>{row_users.user_id}</td>
                                <td>{row_users.username}</td>
                                <td>{row_users.fullname}</td>
                                <td>
                                    <center>
                                        <Button variant='secondary' size='sm' onClick={() => handleShowRead(row_users)}>Read</Button>{' '}
                                        <Button variant='primary' size='sm' onClick={() => handleShowUpdate(row_users)}>Update</Button>{' '}
                                        <Button variant='danger' size='sm' onClick={() => deleteUser(row_users.user_id)}>Delete</Button>
                                    </center>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            <Modal show={showCreate} onHide={() => setShowCreate(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={createUser}>
                        <Row>
                            <Col>
                                <Form.Group controlId="Name">
                                    <Form.Label>Fullname</Form.Label>
                                    <Form.Control type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="Username">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="Password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button variant="success" type="submit" className="mt-3">Save</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Update User Modal */}
            <Modal show={showUpdate} onHide={() => setShowUpdate(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={updateUser}>
                        <Row>
                            <Col>
                                <Form.Group controlId="Name">
                                    <Form.Label>Fullname</Form.Label>
                                    <Form.Control type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="Username">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="Password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button variant="primary" type="submit" className="mt-3">Update</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Read User Modal */}
            <Modal show={showRead} onHide={() => setShowRead(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Row Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser ? (
                        <div>
                            <p><strong>ID:</strong> {selectedUser.user_id}</p>
                            <p><strong>Fullname:</strong> {selectedUser.fullname}</p>
                            <p><strong>Username:</strong> {selectedUser.username}</p>
                        </div>
                    ) : (
                        <p>No data available</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRead(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Dashboard;