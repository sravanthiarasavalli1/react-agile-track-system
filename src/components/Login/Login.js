import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../../context/UserContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(UserContext);

    // Formik form handler
    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email format').required('Email is required'),
            password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        }),
        onSubmit: async (values) => {
            try {
                const response = await axios.get(`http://localhost:4000/users?email=${values.email}&password=${values.password}`);
                if (response.data.length > 0) {
                    const user = response.data[0];
                    login(user);
                    navigate(user.role === 'admin' ? '/' : '/profiles');
                } else {
                    formik.setErrors({ email: 'Invalid email or password' });
                }
            } catch (error) {
                console.error('Error logging in:', error);
                formik.setErrors({ email: 'Server error. Please try again later.' });
            }
        },
    });

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={formik.handleSubmit}>
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder='Enter email'
                    />
                    {formik.touched.email && formik.errors.email && <div style={{ color: 'red' }}>{formik.errors.email}</div>}
                </label>
                <label>
                    Password:
                    <input
                        type="password"
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder='Enter password'
                    />
                    {formik.touched.password && formik.errors.password && <div style={{ color: 'red' }}>{formik.errors.password}</div>}
                </label>
                <button type="submit" disabled={formik.isSubmitting}>Login</button>
            </form>
            <span>Create New Account: </span>
            <button onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
    );
};

export default Login;
