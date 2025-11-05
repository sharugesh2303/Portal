import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// --- API Configuration ---
// Check if the application is running in a local environment
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Use localhost for local development, otherwise use the deployed Render URL
// NOTE: Using the portal-lxfd URL provided in your original code, ensure this matches your live Render endpoint.
const API_BASE_URL = isLocal 
    ? 'http://localhost:8000/api'
    : 'https://portal-lxfd.onrender.com/api'; // <--- PRODUCTION RENDER URL
// --------------------

// --- STYLES - FINAL DARK MODE (CATCHY & HIGH-CONTRAST) ---
const ACCENT_PRIMARY = '#007AFF';   // Vibrant Blue
const ACCENT_DANGER = '#ef4444';    // Strong Red
const TEXT_LIGHT = '#edf2f7';       // Light text for dark background
const TEXT_DARK = '#1a202c';        // Dark text for card content
const CARD_WHITE = '#FFFFFF';       
const BACKGROUND_DARK = '#1a202c';  // Primary dark background color
const CATCHY_GRADIENT = `radial-gradient(circle at top left, ${BACKGROUND_DARK} 0%, #0c121b 100%)`; // The actual gradient

const styles = {
    // Overall Page Container: Ensures vertical and horizontal centering
    pageContainer: { 
        padding: '20px', 
        fontFamily: 'Inter, sans-serif',
        // --- REMOVED GRADIENT FROM HERE ---
        minHeight: '100vh', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',    
        justifyContent: 'center', 
        paddingTop: '30px', 
        paddingBottom: '30px',
        // Set background to a simple color to prevent double layers
        backgroundColor: 'transparent', 
    },
    // Header
    headerContainer: {
        maxWidth: '450px', 
        margin: '0 auto 10px', 
        width: '100%',
        textAlign: 'left',
    },
    headerTitle: {
        fontSize: '2.4rem', 
        color: TEXT_LIGHT, // Reversed color for dark background
        marginBottom: '10px',
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    backButton: {
        textDecoration: 'none',
        color: ACCENT_PRIMARY,
        fontSize: '1rem',
        fontWeight: 600,
        transition: 'color 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        marginBottom: '10px',
    },
    
    // Form Card (The bright element that pops against the dark background)
    formCard: {
        maxWidth: '450px', 
        width: '100%', 
        padding: '35px', 
        backgroundColor: CARD_WHITE,
        borderRadius: '16px', 
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)', // Stronger shadow for depth
        borderTop: `5px solid ${ACCENT_PRIMARY}`, 
        display: 'flex',
        flexDirection: 'column',
        gap: '18px', 
    },
    // Input Styling (Inside the white card)
    input: { 
        padding: '14px 16px', 
        fontSize: '1rem', 
        borderRadius: '10px', 
        border: '1px solid #cbd5e0',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        color: TEXT_DARK,
        backgroundColor: '#f3f4f6', // Light gray background for input fields
    },
    // Submit Button
    button: { 
        padding: '16px', 
        backgroundColor: ACCENT_PRIMARY, 
        color: 'white', 
        border: 'none', 
        borderRadius: '10px', 
        cursor: 'pointer',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        marginTop: '15px', 
        transition: 'all 0.2s',
        boxShadow: '0 6px 18px rgba(0, 122, 255, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    // Message Display
    message: { 
        padding: '15px', 
        marginTop: '20px', 
        borderRadius: '8px',
        fontWeight: 600,
        textAlign: 'center',
        border: '1px solid',
    },
    success: { 
        backgroundColor: '#f0fff4', 
        color: '#2f855a', 
        borderColor: '#9ae6b4',
    },
    error: { 
        backgroundColor: '#fff5f5', 
        color: ACCENT_DANGER,
        borderColor: '#feb2b2',
    },
};

function AddFacultyPage() {
    
    // --- CRITICAL FIX: Applying the background to the document body ---
    useEffect(() => {
        // Apply gradient and ensure it covers the entire viewport
        document.body.style.background = CATCHY_GRADIENT;
        document.body.style.minHeight = '100vh';
        document.body.style.margin = '0'; // Remove default body margin
        
        return () => {
            // Clean up styles when the component unmounts
            document.body.style.background = null;
            document.body.style.minHeight = null;
            document.body.style.margin = null;
        };
    }, []);

    const [formData, setFormData] = useState({ 
        username: '', 
        password: '', 
        name: '',
        department: '', 
        designation: '', 
        baseSalary: '' 
    });
    const [message, setMessage] = useState({ type: '', content: '' });
    const navigate = useNavigate();

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ 
            ...prev, 
            [name]: name === 'baseSalary' ? (value === '' ? '' : Number(value)) : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', content: '' });

        if (typeof formData.baseSalary !== 'number' || formData.baseSalary < 0) {
            setMessage({ type: 'error', content: 'Base Salary must be a positive number.' });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // *** TARGET LINE MODIFIED HERE ***
            await axios.post(`${API_BASE_URL}/faculty`, formData, config);
            
            setMessage({ type: 'success', content: 'Faculty added successfully! Redirecting...' });
            
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 1500);

        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to add faculty member.';
            setMessage({ type: 'error', content: errorMsg });
        }
    };

    return (
        <div style={styles.pageContainer}>
            
            <div style={styles.headerContainer}>
                <Link to="/admin/dashboard" style={styles.backButton}>
                    &larr; **Back to Dashboard**
                </Link>
                <h2 style={styles.headerTitle}>
                    <span role="img" aria-label="add">➕</span> Add New Faculty
                </h2>
            </div>

            {/* --- Message Display --- */}
            {message.content && (
                <div style={{ 
                    ...styles.message, 
                    ...(message.type === 'success' ? styles.success : styles.error),
                    maxWidth: styles.formCard.maxWidth,
                    width: '100%',
                    marginBottom: '20px',
                }}>
                    {message.content}
                </div>
            )}

            {/* --- Add Faculty Form (High-Contrast Card) --- */}
            <form onSubmit={handleSubmit} style={styles.formCard}>
                <input
                    type="text"
                    name="name"
                    placeholder="👤 Full Name (e.g., Dr. Jane Doe)"
                    value={formData.name}
                    onChange={handleFormChange}
                    style={styles.input}
                    required
                />
                <input
                    type="text"
                    name="username"
                    placeholder="🆔 Faculty ID (Username, e.g., F105)"
                    value={formData.username}
                    onChange={handleFormChange}
                    style={styles.input}
                    required
                />
                
                <input
                    type="text"
                    name="department"
                    placeholder="🏛️ Department (e.g., IT/CSE/Cyber)"
                    value={formData.department}
                    onChange={handleFormChange}
                    style={styles.input}
                    required
                />
                <input
                    type="text"
                    name="designation"
                    placeholder="🎓 Designation (e.g., Professor/Asst. Prof)"
                    value={formData.designation}
                    onChange={handleFormChange}
                    style={styles.input}
                    required
                />
                <input
                    type="number"
                    name="baseSalary"
                    placeholder="💰 Base Salary (INR, e.g., 55000)"
                    value={formData.baseSalary}
                    onChange={handleFormChange}
                    style={styles.input}
                    required
                    min="0"
                />
                
                <input
                    type="text"
                    name="password"
                    placeholder="🔑 Temporary Password / Default DOB"
                    value={formData.password}
                    onChange={handleFormChange}
                    style={styles.input}
                    required
                />
                <button type="submit" style={styles.button}>
                    <span role="img" aria-label="rocket">🚀</span> Add Faculty Account
                </button>
            </form>
        </div>
    );
}

export default AddFacultyPage;