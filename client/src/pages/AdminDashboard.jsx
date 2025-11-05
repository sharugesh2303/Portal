import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { saveAs } from 'file-saver';

// --- API Configuration (New Dynamic Logic) ---
// Check if the application is running in a local environment
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Use localhost for local development, otherwise use the deployed Render URL
// NOTE: Using the portal-lxfd URL provided in your original file.
const API_BASE_URL = isLocal 
    ? 'http://localhost:8000/api'
    : 'https://portal-lxfd.onrender.com/api'; 
// ---------------------------------------------

// -------------------------------------------------------------------
// 🎨 UPDATED STYLES FOR A MODERN, ATTRACTIVE DASHBOARD (WOW FACTOR)
// -------------------------------------------------------------------
const TEXT_DARK = '#1a202c';        // Very Dark Text
const BACKGROUND_LIGHT = '#f7fafc'; // Clean Background
const CARD_WHITE = '#FFFFFF';       
const ACCENT_PRIMARY = '#007AFF';   // Electric Blue (Vibrant)
const ACCENT_SECONDARY = '#38b2ac'; // Teal/Cyan
const ACCENT_DANGER = '#e53e3e';    // Strong Red
const ACCENT_SUCCESS = '#48bb78';   // Lively Green

const styles = {
    dashboard: {
        maxWidth: '1100px', // Wider layout
        margin: '40px auto',
        padding: '30px',
        fontFamily: 'Roboto, sans-serif', // Modern font
        color: TEXT_DARK, // Darker text for better contrast
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '20px',
        marginBottom: '30px',
        borderBottom: 'none', // Removed harsh line
    },
    welcomeTitle: {
        fontSize: '2.8rem', // Larger title
        color: '#34495e',
        margin: 0,
        fontWeight: 700,
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#7f8c8d',
        marginTop: '-20px',
        marginBottom: '30px',
    },
    logoutButton: {
        padding: '10px 20px',
        backgroundColor: '#e74c3c', // Red tone
        color: 'white',
        border: 'none',
        borderRadius: '8px', // Softer corners
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        transition: 'background-color 0.3s, transform 0.1s',
        boxShadow: '0 4px 6px rgba(231, 76, 60, 0.2)',
        '&:hover': { backgroundColor: '#c0392b' }, // Hover effect
    },

    // Control Panel (Main Buttons)
    controlPanel: {
        display: 'flex',
        gap: '15px',
        padding: '25px',
        borderRadius: '12px',
        backgroundColor: '#ecf0f1', // Light background for contrast
        alignItems: 'center',
        boxShadow: '0 8px 15px rgba(0,0,0,0.1)', // Elevated shadow
        marginBottom: '30px',
    },
    controlButton: {
        padding: '12px 20px',
        fontSize: '1rem',
        fontWeight: 'bold',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        flexShrink: 0,
    },
    detailsButton: {
        backgroundColor: '#3498db', // Blue
        '&:hover': { backgroundColor: '#2980b9' },
    },
    salaryButton: {
        backgroundColor: '#1abc9c', // Teal
        '&:hover': { backgroundColor: '#16a085' },
    },
    addButton: {
        backgroundColor: '#2ecc71', // Green
        marginLeft: 'auto',
        '&:hover': { backgroundColor: '#27ae60' },
    },

    // Main Sections (Cards)
    section: {
        marginTop: '25px',
        padding: '30px',
        border: 'none', // Removed border
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 20px rgba(0,0,0,0.08)', // Stronger, softer shadow
    },
    sectionTitle: {
        fontSize: '1.8rem',
        color: '#34495e',
        margin: '0 0 20px 0',
        borderBottom: '2px solid #ecf0f1', // Lighter divider
        paddingBottom: '15px',
        fontWeight: 600,
    },

    // Form/Input Elements
    input: { padding: '10px 15px', fontSize: '1rem', borderRadius: '8px', border: '1px solid #bdc3c7', flexGrow: 1, minWidth: '200px' },
    button: {
        padding: '10px 20px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        transition: 'background-color 0.3s',
        '&:hover': { backgroundColor: '#2980b9' },
    },

    // Message Banners
    message: { padding: '15px', marginTop: '20px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold' },
    success: { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' }, // Brighter success
    error: { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }, // Brighter error
    loading: {
        backgroundColor: '#eaf2f8', // Light blue/gray for loading
        color: '#2c3e50',
        border: '1px solid #d6e9f0',
    },

    // Table Styling
    table: { width: '100%', marginTop: '20px', borderCollapse: 'separate', borderSpacing: '0 10px' }, // Separate/spacing for better look
    th: {
        borderBottom: '3px solid #34495e', // Stronger header line
        padding: '15px',
        backgroundColor: '#f4f7f6', // Light gray header
        textAlign: 'left',
        color: '#34495e',
        textTransform: 'uppercase',
        fontSize: '0.9rem',
        fontWeight: 700,
    },
    td: {
        backgroundColor: '#ffffff',
        padding: '15px',
        color: '#333',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', // Subtle shadow on rows
    },
    yearRow: {
        backgroundColor: '#f4f7f6',
    },
    yearCell: {
        padding: '15px',
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#3498db', // Blue highlight for year
    },
    monthCell: {
        paddingLeft: '40px',
    },

    // Action Buttons
    actionCell: { display: 'flex', gap: '8px', alignItems: 'center' },
    actionButton: {
        padding: '7px 12px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        color: 'white',
        textDecoration: 'none',
        display: 'inline-block',
        fontWeight: 'bold',
        transition: 'background-color 0.3s',
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
        '&:hover': { backgroundColor: '#c0392b' },
    },
    editButton: {
        backgroundColor: '#f39c12',
        '&:hover': { backgroundColor: '#e67e22' },
    },
    
    // Upload/Report Specific Styles
    salaryUploadContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
    selectorRow: { display: 'flex', gap: '20px', alignItems: 'center' },
    selector: { padding: '10px 15px', fontSize: '1rem', borderRadius: '8px', border: '1px solid #bdc3c7' },
    fileUploadRow: { display: 'flex', gap: '15px', alignItems: 'center' },
    summaryReportContainer: {
        marginBottom: '25px',
        padding: '20px',
        borderRadius: '10px',
        backgroundColor: '#ecf0f1',
        border: '1px solid #ddd',
    },
    summaryTitle: {
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#34495e',
        marginBottom: '15px',
    },
    summaryLabel: {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#333',
        width: '150px',
    },
    directDownloadButton: {
        padding: '8px 15px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        backgroundColor: '#3498db',
        marginLeft: '10px',
        transition: 'background-color 0.3s',
        '&:hover': { backgroundColor: '#2980b9' },
    }
};

// -------------------------------------------------------------------
// --- CONSTANTS (UNCHANGED) ---
// -------------------------------------------------------------------
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthOrder = MONTHS.reduce((acc, month, index) => {
    acc[month] = index;
    return acc;
}, {});

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => currentYear - 1 + i);
// ... (getLastNMonths is not used in the render, keeping it for completeness)
// const getLastNMonths = (n) => { ... };

// -------------------------------------------------------------------
// --- COMPONENT LOGIC (MINIMAL CHANGES TO APPLY NEW STYLES) ---
// -------------------------------------------------------------------
function AdminDashboard() {
    const [facultyList, setFacultyList] = useState([]);
    const [csvFile, setCsvFile] = useState(null);
    const [salaryCsvFile, setSalaryCsvFile] = useState(null);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [salaryMessage, setSalaryMessage] = useState({ type: '', content: '' });
    const [reportMonths, setReportMonths] = useState(3);
    
    const navigate = useNavigate();
    const location = useLocation();
    const [showDetailsUpload, setShowDetailsUpload] = useState(true);
    const [showSalaryUpload, setShowSalaryUpload] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [salaryHistory, setSalaryHistory] = useState({});

    useEffect(() => {
        // Set a softer background color for the body
        document.body.style.backgroundColor = '#ecf0f1'; 
        return () => {
            document.body.style.backgroundColor = null;
        };
    }, []);

    const fetchFaculty = async () => { 
        setMessage({ type: 'loading', content: 'Loading faculty list...' });
        try {
            // *** API CALL 1 (GET Faculty List) ***
            const response = await axios.get(`${API_BASE_URL}/faculty`); 
            setFacultyList(response.data);
            setMessage({ type: 'success', content: 'Faculty list loaded successfully.' });
        } catch (error) {
            console.error('Error fetching faculty:', error);
            setMessage({ type: 'error', content: 'Could not load faculty data.' });
        }
    };
    
    const fetchSalaryHistory = async () => { 
        try {
            // *** API CALL 2 (GET Salary History) ***
            const response = await axios.get(`${API_BASE_URL}/salary/history`);
            const groupedData = response.data.reduce((acc, record) => {
                const { year, month, count } = record;
                if (!acc[year]) {
                    acc[year] = [];
                }
                acc[year].push({ month, count });
                return acc;
            }, {});
            setSalaryHistory(groupedData);
            setSalaryMessage({ type: 'success', content: 'Salary history loaded.' });
        } catch (error) {
            console.error('Error fetching salary history:', error);
            setSalaryMessage({ type: 'error', content: 'Could not load salary history.' });
        }
    };

    useEffect(() => {
        if (showDetailsUpload) {
            fetchFaculty();
        }
        if (showSalaryUpload) {
            fetchSalaryHistory();
        }
    }, [showDetailsUpload, showSalaryUpload, location.key]); 

    const handleAdminBulkReport = async (months) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage({ type: 'error', content: 'Not logged in. Please refresh and log in.' });
            return;
        }

        // *** API CALL 3 (GET Admin Bulk Report) ***
        const reportUrl = `${API_BASE_URL}/salary/report/${months}`;
        setMessage({ type: 'loading', content: `Preparing bulk report for last ${months} months...` });

        try {
            const response = await axios.get(reportUrl, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                responseType: 'blob' 
            });

            let filename = `Admin_Bulk_Payslips_Last_${months}_Months.pdf`;
            const disposition = response.headers['content-disposition'];
            if (disposition) {
                const matches = /filename="?([^"]*)"?/.exec(disposition);
                if (matches != null && matches[1]) filename = matches[1];
            }

            saveAs(response.data, filename);
            setMessage({ type: 'success', content: `Bulk PDF downloaded for ${months} months.` });

        } catch (error) {
            console.error('Admin Bulk Download Error:', error);
            setMessage({ type: 'error', content: error.response?.data?.message || 'Download failed (Authorization or Server error).' });
        }
    };

    const handleDirectDownload = async (endpoint, param) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage({ type: 'error', content: 'Authorization token missing. Please log in again.' });
            return;
        }
        
        // *** API CALL 4 & 5 (GET Annual/Monthly Download) ***
        const url = `${API_BASE_URL}/salary/${endpoint}/${param}`;
        setMessage({ type: 'loading', content: `Preparing report for ${param}...` });

        try {
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob' 
            });

            let filename = `${param}_Report.pdf`;
            const disposition = response.headers['content-disposition'];
            
            if (disposition) {
                const matches = /filename="?([^"]*)"?/.exec(disposition);
                if (matches && matches[1]) filename = matches[1];
            }

            saveAs(response.data, filename);
            setMessage({ type: 'success', content: `File downloaded: ${filename}` });

        } catch (error) {
            console.error('Download Error:', error);
            setMessage({ type: 'error', content: error.response?.data?.message || 'Download failed (Server error).' });
        }
    };

    const handleFileChange = (e) => { setCsvFile(e.target.files[0]); };
    
    const handleCsvUpload = async () => { 
        if (!csvFile) { 
            setMessage({ type: 'error', content: 'Please select a CSV file first.' });
            return; 
        }
        setMessage({ type: 'loading', content: 'Uploading and processing faculty details...' });
        
        const uploadData = new FormData();
        uploadData.append('file', csvFile);
        
        try {
            // *** API CALL 6 (POST Bulk Faculty Upload) ***
            const response = await axios.post(`${API_BASE_URL}/salary/upload-faculty`, uploadData);
            const { successful, failed, errors } = response.data;
            let successMsg = `Faculty Details CSV Uploaded! Successful: ${successful}, Failed: ${failed}.`;
            if (failed > 0) successMsg += ` Errors: ${errors.slice(0, 3).join('; ')}...`;
            
            setMessage({ type: 'success', content: successMsg });
            setSalaryMessage({ type: '', content: '' });
            await fetchFaculty(); 
        } catch (error) {
            setMessage({ type: 'error', content: error.response?.data?.message || 'Upload failed.' });
            setSalaryMessage({ type: '', content: '' });
        }
    };

    const handleSalaryFileChange = (e) => { setSalaryCsvFile(e.target.files[0]); };
    const handleSalaryCsvUpload = async () => { 
        if (!salaryCsvFile) { 
            setSalaryMessage({ type: 'error', content: 'Please select a CSV file first.' });
            return; 
        }
        setSalaryMessage({ type: 'loading', content: 'Uploading and processing salary data...' });
        
        const uploadData = new FormData();
        uploadData.append('file', salaryCsvFile);
        uploadData.append('month', selectedMonth);
        uploadData.append('year', selectedYear);
        try {
            // *** API CALL 7 (POST Bulk Salary Upload) ***
            const response = await axios.post(`${API_BASE_URL}/salary/upload-monthly`, uploadData);
            const { created, failed, errors } = response.data;
            let successMsg = `Salary CSV Uploaded! Created: ${created}, Failed: ${failed}.`;
            if (failed > 0) successMsg += ` Errors: ${errors.slice(0, 3).join('; ')}...`;
            setSalaryMessage({ type: 'success', content: successMsg });
            setMessage({ type: '', content: '' });
            fetchSalaryHistory();
        } catch (error) {
            setSalaryMessage({ type: 'error', content: error.response?.data?.message || 'Upload failed.' });
            setMessage({ type: '', content: '' });
        }
    };
    
    const handleLogout = () => { 
        localStorage.removeItem('token'); // Added token removal for proper logout
        navigate('/login'); 
    };
    const toggleDetails = () => { 
        setMessage({ type: '', content: '' });
        setShowDetailsUpload(true); // Always show when toggled
        setShowSalaryUpload(false); 
    };
    const toggleSalary = () => { 
        setSalaryMessage({ type: '', content: '' });
        setShowSalaryUpload(true); // Always show when toggled
        setShowDetailsUpload(false); 
    };
    
    const handleDeleteFaculty = async (facultyId) => { 
        if (window.confirm('Are you sure you want to delete this faculty member?')) {
            try {
                setMessage({ type: 'loading', content: 'Deleting faculty member...' });
                // *** API CALL 8 (DELETE Faculty) ***
                await axios.delete(`${API_BASE_URL}/faculty/${facultyId}`); 
                setMessage({ type: 'success', content: 'Faculty deleted successfully.' });
                fetchFaculty(); 
            } catch (error) {
                setMessage({ type: 'error', content: error.response?.data?.message || 'Delete failed.' });
            }
        }
    };
    const handleDeleteHistory = async (year, month) => { 
        if (window.confirm(`Are you sure you want to delete all ${month} ${year} salary records? This cannot be undone.`)) {
            try {
                setSalaryMessage({ type: 'loading', content: 'Deleting history...' });
                // *** API CALL 9 (DELETE Salary History) ***
                const response = await axios.delete(`${API_BASE_URL}/salary/history/${year}/${month}`);
                setSalaryMessage({ type: 'success', content: response.data.message });
                fetchSalaryHistory();
            } catch (error) {
                setSalaryMessage({ type: 'error', content: error.response?.data?.message || 'Delete failed.' });
            }
        }
    };

    // -------------------------------------------------------------------
    // --- JSX RENDER (Applying New Styles) ---
    // -------------------------------------------------------------------
    return (
        <div style={styles.dashboard}>
            <div style={styles.header}>
                <h1 style={styles.welcomeTitle}>👨‍💻 Admin Dashboard</h1>
                <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
            </div>
            <p style={styles.subtitle}>Manage faculty details, salaries, and reports with a clear, organized interface.</p>

            <div style={styles.controlPanel}>
                {/* Toggles now use a ternary to highlight the active view */}
                <button 
                    onClick={toggleDetails} 
                    style={{
                        ...styles.controlButton, 
                        ...styles.detailsButton,
                        opacity: showDetailsUpload ? 1 : 0.6,
                    }}
                >
                    Faculty Details
                </button>
                <button 
                    onClick={toggleSalary} 
                    style={{
                        ...styles.controlButton, 
                        ...styles.salaryButton,
                        opacity: showSalaryUpload ? 1 : 0.6,
                    }}
                >
                    Faculty Salaries
                </button>
                <Link to="/admin/add-faculty" style={{...styles.controlButton, ...styles.addButton}}>
                    ➕ Add New Faculty
                </Link>
            </div>

            {/* --- Global Message Display --- */}
            {message.content && (
                <div style={{ 
                    ...styles.message, 
                    ...(message.type === 'loading' ? styles.loading : (message.type === 'success' ? styles.success : styles.error)) 
                }}>
                    {message.content}
                </div>
            )}
            {salaryMessage.content && (
                <div style={{ 
                    ...styles.message, 
                    ...(salaryMessage.type === 'loading' ? styles.loading : (salaryMessage.type === 'success' ? styles.success : styles.error)) 
                }}>
                    {salaryMessage.content}
                </div>
            )}


            {/* ------------------------------------------------------------------- */}
            {/* --- (SECTION 1) FACULTY DETAILS --- */}
            {/* ------------------------------------------------------------------- */}
            {showDetailsUpload && (
                <>
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>📥 Bulk Add or Update Faculty Details</h2>
                        <p>Upload a CSV file with all required columns: <strong>name, username, password, department, designation, baseSalary</strong></p>
                        <div style={styles.fileUploadRow}> {/* Reusing fileUploadRow style */}
                            <input 
                                type="file" 
                                accept=".csv" 
                                onChange={handleFileChange} 
                                style={styles.input} 
                            />
                            <button onClick={handleCsvUpload} style={styles.button}>
                                Upload Details
                            </button>
                        </div>
                    </div>
                    
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>📋 Faculty List</h2>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Faculty ID</th>
                                    <th style={styles.th}>Department</th> 
                                    <th style={styles.th}>Designation</th> 
                                    <th style={styles.th}>Base Salary</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {facultyList.map((faculty) => (
                                    <tr key={faculty._id}>
                                        <td style={styles.td}>{faculty.name}</td>
                                        <td style={styles.td}>{faculty.username}</td>
                                        <td style={styles.td}>{faculty.department || 'N/A'}</td> 
                                        <td style={styles.td}>{faculty.designation || 'N/A'}</td> 
                                        <td style={styles.td}>
                                            {faculty.baseSalary ? faculty.baseSalary.toLocaleString('en-IN', { 
                                                style: 'currency', currency: 'INR' 
                                            }) : 'N/A'}
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.actionCell}>
                                                <Link 
                                                    to={`/admin/edit-faculty/${faculty._id}`}
                                                    style={{...styles.actionButton, ...styles.editButton}}
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteFaculty(faculty._id)}
                                                    style={{...styles.actionButton, ...styles.deleteButton}}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* ------------------------------------------------------------------- */}
            {/* --- (SECTION 2) FACULTY SALARIES --- */}
            {/* ------------------------------------------------------------------- */}
            {showSalaryUpload && (
                <>
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>💸 Bulk Upload Faculty Salaries</h2>
                        <p>Select month and year, then upload a CSV with columns: <strong>username, basic, hra, da, ... (detailed components)</strong></p>
                        <div style={styles.salaryUploadContainer}>
                            <div style={styles.selectorRow}>
                                <label htmlFor="year-select" style={styles.summaryLabel}>Year:</label>
                                <select id="year-select" style={styles.selector} value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                                    {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                                <label htmlFor="month-select" style={styles.summaryLabel}>Month:</label>
                                <select id="month-select" style={styles.selector} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                                    {MONTHS.map(month => <option key={month} value={month}>{month}</option>)}
                                </select>
                            </div>
                            <div style={styles.fileUploadRow}>
                                <input type="file" accept=".csv" onChange={handleSalaryFileChange} style={styles.input} />
                                <button onClick={handleSalaryCsvUpload} style={{...styles.button, backgroundColor: '#1abc9c'}}>
                                    Upload Salaries
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>📜 Salary Upload History & Reports</h2>
                        
                        {/* --- ADMIN BULK REPORT CONTROLS (SECURE) --- */}
                        <div style={styles.summaryReportContainer}>
                            <h3 style={styles.summaryTitle}>📄 Admin Bulk Payslip Download (Multi-Page PDF)</h3>
                            
                            <div style={styles.selectorRow}>
                                <span style={styles.summaryLabel}>Select Period:</span>
                                <select 
                                    id="report-months" 
                                    style={styles.selector} 
                                    value={reportMonths} 
                                    onChange={(e) => setReportMonths(Number(e.target.value))}
                                >
                                    <option value={3}>Last 3 Months</option>
                                    <option value={6}>Last 6 Months</option>
                                    <option value={9}>Last 9 Months</option>
                                    <option value={12}>Last 12 Months (Annual)</option>
                                </select>
                                
                                <button 
                                    onClick={() => handleAdminBulkReport(reportMonths)} 
                                    style={{...styles.controlButton, backgroundColor: '#3498db', padding: '10px 18px'}}
                                >
                                    Download Bulk PDF
                                </button>
                            </div>

                        </div>
                        {/* --- END ADMIN BULK CONTROLS --- */}


                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Time Period</th>
                                    <th style={styles.th}>Faculty Records Uploaded</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(salaryHistory).sort((a, b) => b - a).map(year => (
                                    <React.Fragment key={year}>
                                        <tr style={styles.yearRow}>
                                            <td style={styles.yearCell}>{year}</td>
                                            <td style={styles.td}></td>
                                            <td style={styles.td}>
                                                <button
                                                    // *** API CALL 4 (GET Annual Download) ***
                                                    onClick={() => handleDirectDownload('download', year)}
                                                    style={styles.directDownloadButton}
                                                >
                                                    Download Annual PDF
                                                </button>
                                            </td>
                                        </tr>
                                        {salaryHistory[year]
                                            .sort((a, b) => monthOrder[b.month] - monthOrder[a.month]) 
                                            .map(monthRecord => (
                                            <tr key={`${year}-${monthRecord.month}`}>
                                                <td style={{...styles.td, ...styles.monthCell}}>{monthRecord.month}</td>
                                                <td style={styles.td}>{monthRecord.count}</td>
                                                <td style={styles.td}>
                                                    <div style={styles.actionCell}>
                                                        <button
                                                            // *** API CALL 5 (GET Monthly Download) ***
                                                            onClick={() => handleDirectDownload('download', `${year}/${monthRecord.month}`)}
                                                            style={styles.directDownloadButton}
                                                        >
                                                            Download Monthly PDF
                                                        </button>
                                                        
                                                        <button
                                                            onClick={() => handleDeleteHistory(year, monthRecord.month)}
                                                            style={{...styles.actionButton, ...styles.deleteButton}}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            
        </div>
    );
}

export default AdminDashboard;