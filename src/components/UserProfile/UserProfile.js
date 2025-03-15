import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../../context/UserContext';

const UserProfile = () => {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4000/users');
                if (user?.role === 'admin') {
                    setUsers(response.data.filter(u => u.role !== 'admin'));
                } else {
                    setSelectedUser(user);
                    fetchTasks(user?.id);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, [user]);

    const fetchTasks = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:4000/tasks?assignedTo=${userId}`);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleGetHistory = (userId) => {
        setTasks([]);
        setSelectedUser(users.find(u => u.id === userId));
        fetchTasks(userId);
    };

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            role: 'employee',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Name is required'),
            email: Yup.string().email('Invalid email format').required('Email is required'),
            password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
            role: Yup.string().oneOf(['employee', 'admin'], 'Invalid role').required('Role is required'),
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                const response = await axios.post('http://localhost:4000/users', values);
                setUsers(prevUsers => [...prevUsers, response.data]);
                setShowForm(false);
                resetForm();
            } catch (error) {
                console.error('Error adding user:', error);
            }
        },
    });

    return (
        <div>
            <h2>User Profiles</h2>

            {user?.role === 'admin' && (
                <div>
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add New User'}
                    </button>
                    {showForm && (
                        <form onSubmit={formik.handleSubmit}>
                            {['name', 'email', 'password'].map((field) => (
                                <div key={field}>
                                    <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                                    <input
                                        type={field === 'password' ? 'password' : 'text'}
                                        {...formik.getFieldProps(field)}
                                    />
                                    {formik.touched[field] && formik.errors[field] && (
                                        <div style={{ color: 'red' }}>{formik.errors[field]}</div>
                                    )}
                                </div>
                            ))}
                            <div>
                                <label>Role:</label>
                                <select {...formik.getFieldProps('role')}>
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                                {formik.touched.role && formik.errors.role && (
                                    <div style={{ color: 'red' }}>{formik.errors.role}</div>
                                )}
                            </div>
                            <button type="submit">Create User</button>
                        </form>
                    )}
                    <ul>
                        {users.map(u => (
                            <li key={u.id}>
                                <strong>Name:</strong> {u.name} <br />
                                <strong>Email:</strong> {u.email} <br />
                                <button onClick={() => handleGetHistory(u.id)}>Get History</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {selectedUser && (
                <div>
                    <h3>Tasks Worked By {selectedUser.name}</h3>
                    <ul>
                        {tasks.map(task => (
                            <li key={task.id}>
                                <strong>Title:</strong> {task.title} <br />
                                <strong>Description:</strong> {task.description} <br />
                                <strong>Status:</strong> {task.status}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
