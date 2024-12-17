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
import { jwtDecode } from 'jwt-decode';
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
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#FF7043',
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

    return (
        <>
            {/* Navbar */}
            <Navbar style={{ backgroundColor: 'Black' }} variant="dark">
                <Container>
                    <Navbar.Brand href="#home">Computer Shop</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="#users">Bantay</Nav.Link>
                        <Nav.Link href="#departments">Teller</Nav.Link>
                        <Nav.Link href="#courses">BastaAno</Nav.Link>
                    </Nav>
                    <Nav className="ms-auto">
                        <NavDropdown title={user ? user.username : 'Menu'} align="end">
                            <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Container>
            </Navbar>

            <div className='container mt-4' style={{ backgroundColor: '#2f2f2f', color: 'white' }}> {/* Light Black Background */}
                <div className='d-flex justify-content-end mb-2'>
                    <Button variant="success" onClick={() => setShowCreate(true)}>Create User</Button>
                </div>

                {/* User Table */}
                <table className='table table-bordered text-center' style={{ backgroundColor: '#444444', color: 'white' }}> {/* Table Background Color */}
                    <thead style={{ backgroundColor: '#666666' }}>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Fullname</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((row_users) => (
                                <tr key={row_users.user_id}>
                                    <td>{row_users.user_id}</td>
                                    <td>{row_users.username}</td>
                                    <td>{row_users.fullname}</td>
                                    <td>
                                        <Button variant="info" size="sm" onClick={() => setShowRead(true)}>Read</Button>{' '}
                                        <Button variant="warning" size="sm">Update</Button>{' '}
                                        <Button variant="danger" size="sm" onClick={() => deleteUser(row_users.user_id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No Users Found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default Dashboard;
