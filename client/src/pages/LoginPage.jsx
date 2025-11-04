import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- STYLES ---
const loginStyles = {
    // Styles for the whole page/background
    pageContainer: {
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: `url('/jjcet.jpg')`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat',
        position: 'relative', 
    },
    // Styles for the central card - DARK BLUE TRANSPARENT THEME
    card: {
        backgroundColor: 'rgba(20, 35, 65, 0.9)', // Deep midnight blue with 90% opacity
        borderRadius: '10px',
        padding: '40px 30px', 
        width: '320px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)', 
        textAlign: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#E0E0E0', 
        fontSize: '1.5rem',
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    // Common button style for role selection
    roleButton: {
        padding: '12px 20px',
        fontSize: '16px',
        borderRadius: '25px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.3s, transform 0.2s',
        border: '1px solid #007bff', 
    },
    adminButton: {
        backgroundColor: '#007bff',
        color: 'white',
    },
    facultyButton: {
        backgroundColor: 'white',
        color: '#007bff',
    },
    // Style for form group spacing and text - TIGHTER SPACING
    formGroup: { 
        marginBottom: '15px', // Reduced margin
        textAlign: 'left',
    },
    // Styles for the form inputs - SLIGHTLY SMALLER
    input: {
        width: '100%',
        padding: '10px', // Reduced vertical padding
        fontSize: '16px',
        boxSizing: 'border-box',
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        transition: 'border-color 0.3s, box-shadow 0.3s',
        WebkitAppearance: 'none', 
        MozAppearance: 'none', 
        appearance: 'none',
        outline: 'none',
        backgroundColor: 'white', 
        color: '#333', 
    },
    // Focus effect style
    inputFocus: {
        borderColor: '#007bff',
        boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)',
    },
    submitButton: {
        padding: '12px', // Reduced padding for better fit
        fontSize: '18px',
        backgroundColor: '#3773F7', 
        color: 'white',
        border: 'none',
        borderRadius: '8px', 
        cursor: 'pointer',
        width: '100%',
        fontWeight: 'bold',
        marginTop: '10px',
    },
    backButton: {
        background: 'none',
        border: 'none',
        color: '#E0E0E0', 
        cursor: 'pointer',
        textAlign: 'left',
        marginBottom: '15px',
        padding: '0',
        fontSize: '0.9rem',
    }
};

// --- COMPONENT ---
function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loginRole, setLoginRole] = useState(null); 
    const [focusedInput, setFocusedInput] = useState(null); 
    const navigate = useNavigate();

    useEffect(() => {
        setUsername('');
        setPassword('');
        setMessage('');
        setFocusedInput(null);
    }, [loginRole]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');

        try {
            const response = await axios.post('http://localhost:8000/api/auth/login', {
                username: username,
                password: password,
            });

            localStorage.setItem('token', response.data.token); 
            console.log('Login successful:', response.data);
            const userRole = response.data.user.role;

            if (userRole === 'admin') {
                navigate('/admin/dashboard');
            } else if (userRole === 'faculty') {
                navigate('/faculty/dashboard');
            } else {
                setMessage('Login successful, but role is unknown.');
            }

        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                setMessage(`Error: ${error.response.data.message}`); 
            } else {
                setMessage('Error: Could not connect to server.');
            }
        }
    };

    const isFaculty = loginRole === 'faculty';
    const title = loginRole === 'admin' ? 'Admin Login' : 'Faculty Login';
    const usernameLabel = isFaculty ? 'Faculty ID' : 'Admin Username';
    const passwordLabel = isFaculty ? 'Password / DOB' : 'Password';
    
    // --- Render Login Form (Admin/Faculty) ---
    const renderLoginForm = () => (
        <div style={loginStyles.card}>
            <button onClick={() => setLoginRole(null)} style={loginStyles.backButton}>
                &larr; Back to Role Selection
            </button>

            <h2 style={loginStyles.title}>{title}</h2>
            <hr style={{ border: '0', borderTop: '1px solid #555', margin: '15px 0' }} />

            <form onSubmit={handleSubmit}>
                <div style={loginStyles.formGroup}>
                    <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#E0E0E0' }}>
                        {usernameLabel}
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onFocus={() => setFocusedInput('username')}
                        onBlur={() => setFocusedInput(null)}
                        style={{
                            ...loginStyles.input,
                            ...(focusedInput === 'username' ? loginStyles.inputFocus : {})
                        }}
                        required
                    />
                </div>
                
                <div style={loginStyles.formGroup}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#E0E0E0' }}>
                        {passwordLabel}
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        style={{
                            ...loginStyles.input,
                            ...(focusedInput === 'password' ? loginStyles.inputFocus : {})
                        }}
                        required
                    />
                </div>
                
                <button type="submit" style={loginStyles.submitButton}>Login</button>
            </form>
            
            {message && <p style={{ marginTop: '20px', color: 'red', fontSize: '14px' }}>{message}</p>}
        </div>
    );

    // --- Render Role Selection View (Initial Screen) ---
    const renderRoleSelection = () => (
        <div style={loginStyles.card}>
            <h1 style={{...loginStyles.title, fontSize: '1.8rem', lineHeight: '1.2'}}>
                JJ College of Engineering and Technology
            </h1>
            <p style={{ margin: '15px 0', color: '#007bff', fontWeight: 'bold' }}>— Welcome —</p>
            <div style={loginStyles.buttonGroup}>
                <button 
                    onClick={() => setLoginRole('admin')} 
                    style={{...loginStyles.roleButton, ...loginStyles.adminButton}}
                >
                    <span role="img" aria-label="admin">🧑‍💼</span> Admin Login
                </button>
                <button 
                    onClick={() => setLoginRole('faculty')} 
                    style={{...loginStyles.roleButton, ...loginStyles.facultyButton}}
                >
                    <span role="img" aria-label="faculty">👨‍🏫</span> Faculty Login
                </button>
            </div>
            <p style={{ marginTop: '25px', color: '#B0B0B0', fontSize: '0.8rem' }}>
                Powered by Neroca Crew
            </p>
        </div>
    );

    // --- Main Render Logic ---
    return (
        <div style={loginStyles.pageContainer}>
            {loginRole === null && renderRoleSelection()}
            {loginRole !== null && renderLoginForm()}
        </div>
    );
}

export default LoginPage;