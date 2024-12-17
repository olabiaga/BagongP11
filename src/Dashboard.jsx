import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import Swal from 'sweetalert2';

import { API_ENDPOINT } from './Api';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    const getToken = () => {
        const storedToken = localStorage.getItem('token');
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
                setUser(token); // Mocked for now
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
        localStorage.removeItem('token');
        navigate("/login");
    };

    const deleteUser = async (user_id) => {
        const isConfirm = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => result.isConfirmed);

        if (!isConfirm) return;

        try {
            await axios.delete(`${API_ENDPOINT}/user/${user_id}`, { headers: getHeaders() });
            setUsers(users.filter(user => user.user_id !== user_id));
            Swal.fire('Deleted!', 'User has been deleted.', 'success');
        } catch (error) {
            Swal.fire('Error!', 'Failed to delete user.', 'error');
        }
    };

    return (
        <>
            {/* Navbar */}
            <Navbar variant="dark" style={{ backgroundColor: '#222' }}>
                <Container>
                    <Navbar.Brand style={{ color: '#fff' }}>Point Blank Shop</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link style={{ color: '#ddd' }} href="#users">Users</Nav.Link>
                        <Nav.Link style={{ color: '#ddd' }} href="#departments">Top Up Center</Nav.Link>
                        <Nav.Link style={{ color: '#ddd' }} href="#courses">Download</Nav.Link>
                    </Nav>
                    <Nav className="ms-auto">
                        <NavDropdown title={user ? user.username : 'Menu'} align="end">
                            <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Container>
            </Navbar>

            {/* Main Content */}
            <div className='container mt-4' style={{ backgroundColor: '#121212', color: '#ddd', padding: '20px', borderRadius: '8px' }}>
                <div className='d-flex justify-content-end mb-2'>
                    <Button variant="success" onClick={() => console.log('Create User')}>Create User</Button>
                </div>

                {/* User Table */}
                <table className='table table-dark table-bordered text-center'>
                    <thead>
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
                                        <Button variant="info" size="sm" className="me-2">Read</Button>
                                        <Button variant="warning" size="sm" className="me-2">Update</Button>
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
  