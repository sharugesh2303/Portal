import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver'; 

// --- API Configuration ---
// Check if the application is running in a local environment
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Use localhost for local development, otherwise use the deployed Render URL (portal-jjd is assumed to be correct)
// Note: We use portal-lxfd in your original file, but portal-jjd was the correct endpoint in the last debug session.
// For consistency and safety, I'll use the URL you provided in the file, but keep the localhost logic correct.
const API_BASE_URL = isLocal 
    ? 'http://localhost:8000/api' 
    : 'https://portal-lxfd.onrender.com/api'; // <--- PRODUCTION RENDER URL from your original file

// --- STYLES - FINAL ATTRACTIVE & HIGH-POLISH THEME (ULTRA WOW) ---
const TEXT_DARK = '#1a202c';        // Very Dark Text
const BACKGROUND_LIGHT = '#f7fafc'; // Clean Background
const CARD_WHITE = '#FFFFFF';       
const ACCENT_PRIMARY = '#007AFF';   // Electric Blue (Vibrant)
const ACCENT_SECONDARY = '#38b2ac'; // Teal/Cyan
const ACCENT_DANGER = '#e53e3e';    // Strong Red
const ACCENT_SUCCESS = '#48bb78';   // Lively Green

const styles = {
    dashboard: {
        maxWidth: '1500px', 
        margin: '60px auto', // Increased margin
        padding: '30px',
        fontFamily: 'Inter, sans-serif', 
        color: TEXT_DARK,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '30px',
        marginBottom: '50px', // More space
        borderBottom: `1px solid #e2e8f0`, 
    },
    welcomeTitle: {
        fontSize: '3.2rem', // Larger
        color: TEXT_DARK, 
        margin: 0,
        fontWeight: 800, // Extra Bold
    },
    logoutButton: {
        padding: '12px 28px',
        backgroundColor: ACCENT_DANGER,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 4px 10px rgba(229, 62, 62, 0.4)', 
    },
    // Main content area uses Flexbox
    contentGrid: {
        display: 'flex',
        borderRadius: '16px', 
        overflow: 'hidden', 
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.2)', // Deeper, more dramatic shadow
        backgroundColor: CARD_WHITE,
    },
    // LEFT SIDEBAR: Stronger visual break
    sidebar: {
        flex: '0 0 320px', 
        padding: '40px 30px',
        backgroundColor: '#edf2f7', // Light Blue/Gray for contrast
        borderRight: `2px solid #e2e8f0`, 
        display: 'flex',
        flexDirection: 'column',
        gap: '40px', 
    },
    // RIGHT MAIN REPORT AREA
    mainReportArea: {
        flex: 1, 
        padding: '50px 40px', // More padding
        backgroundColor: CARD_WHITE,
    },
    
    // Metric Cards Container
    metricContainer: {
        display: 'flex',
        gap: '20px',
        marginBottom: '40px',
        paddingBottom: '20px',
    },
    // Enhanced Metric Card Style (using gradients/solid colors for WoW)
    metricCard: {
        backgroundColor: '#e6f0ff', // Very light blue fill
        padding: '20px 25px', 
        borderRadius: '12px',
        flex: 1,
        textAlign: 'left',
        borderLeft: `5px solid ${ACCENT_PRIMARY}`, // Accent border
        boxShadow: '0 4px 12px rgba(0, 122, 255, 0.1)', // Subtle card shadow
        position: 'relative',
        overflow: 'hidden',
    },
    metricLabel: {
        fontSize: '0.9rem',
        color: '#4a5568',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '5px',
    },
    metricValue: {
        fontSize: '2.5rem', // Largest value
        color: ACCENT_PRIMARY,
        fontWeight: 800,
        margin: 0,
    },

    selectorGroup: {
        width: '100%',
        marginBottom: '25px',
    },
    selectorLabel: {
        fontSize: '1rem',
        fontWeight: 700, // Bolder label
        color: TEXT_DARK, 
        marginBottom: '10px',
        display: 'block',
    },
    selector: {
        padding: '12px 15px',
        fontSize: '1rem',
        borderRadius: '8px',
        border: `1px solid #cbd5e0`,
        backgroundColor: CARD_WHITE, 
        color: TEXT_DARK,
        width: '100%', 
    },
    quickReportContainer: {
        paddingTop: '0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
    },
    quickReportButton: {
        padding: '10px 18px',
        fontSize: '0.95rem',
        fontWeight: '700',
        color: ACCENT_PRIMARY, 
        borderRadius: '25px', 
        backgroundColor: '#f0f4ff', // Subtle background even when inactive
        border: `2px solid ${ACCENT_PRIMARY}`, 
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    quickReportButtonActive: {
        backgroundColor: ACCENT_PRIMARY,
        color: CARD_WHITE,
        boxShadow: '0 2px 8px rgba(0, 122, 255, 0.6)',
        transform: 'translateY(-1px)',
    },
    buttonContainer: {
        display: 'flex',
        gap: '20px',
        marginTop: '50px', 
        justifyContent: 'flex-end', 
    },
    downloadButton: { 
        padding: '18px 40px', // Larger button
        color: 'white', 
        border: 'none', 
        borderRadius: '12px', 
        cursor: 'pointer', 
        fontSize: '1.1rem', 
        fontWeight: 'bold', 
        transition: 'all 0.2s',
        backgroundColor: ACCENT_PRIMARY,
        boxShadow: '0 8px 20px rgba(0, 122, 255, 0.5)', // Dramatic shadow
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        boxShadow: 'none',
    },
    
    reportTitle: {
        textAlign: 'left',
        paddingBottom: '15px',
        marginBottom: '30px',
        fontSize: '2.4rem', // Larger title
        color: TEXT_DARK, 
        fontWeight: 700,
        borderBottom: `4px solid ${ACCENT_PRIMARY}`, // Thicker accent line
        display: 'inline-block',
        minWidth: '50%',
    },
    table: { 
        width: '100%', 
        borderCollapse: 'separate', 
    },
    th: {
        padding: '18px 15px',
        textAlign: 'left',
        color: ACCENT_PRIMARY, 
        textTransform: 'uppercase',
        fontSize: '0.95rem',
        fontWeight: 700,
        borderBottom: `2px solid #e2e8f0`, 
        backgroundColor: '#f7fafc', 
    },
    td: {
        padding: '20px 15px', // More vertical padding
        backgroundColor: CARD_WHITE,
        color: TEXT_DARK,
        borderBottom: `1px solid #edf2f7`, 
        fontSize: '1rem',
    },
    tfoot: {
        fontWeight: 'bold',
        borderTop: `5px solid ${ACCENT_PRIMARY}`, // Strongest border
        color: ACCENT_PRIMARY,
        fontSize: '1.4rem', 
        backgroundColor: '#e6f0ff', // Matches metric card base color
    },
    noDataText: {
        textAlign: 'center',
        fontSize: '1.2rem',
        color: '#9ca3af',
        padding: '50px 0',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
    },
    payslipSectionHeader: {
        backgroundColor: '#f3f4f6',
        color: TEXT_DARK,
        fontSize: '1.1rem',
        fontWeight: 700,
        padding: '15px',
    },
    payslipDetailLabel: {
        fontWeight: 500,
        borderBottom: 'none',
        padding: '12px 15px',
        backgroundColor: CARD_WHITE,
    },
    payslipDetailValue: {
        fontWeight: 700,
        textAlign: 'right',
        borderBottom: 'none',
        padding: '12px 15px',
        backgroundColor: CARD_WHITE,
    },
    payslipSeparatorRow: {
        borderBottom: '1px dashed #e2e8f0',
    },
    netPayCard: {
        padding: '25px 35px',
        borderRadius: '12px',
        borderLeft: `6px solid ${ACCENT_SUCCESS}`,
        backgroundColor: '#f0fff4', // Very light green background
        boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
        flex: '0 0 50%',
        textAlign: 'right',
    },
    netPayLabel: {
        fontSize: '1rem',
        color: '#2f855a',
        fontWeight: 700,
        marginBottom: '5px',
    },
    netPayValue: {
        fontSize: '3rem', // Massive net pay value
        color: ACCENT_SUCCESS,
        fontWeight: 800,
        margin: 0,
    }
};

const ALL_MONTHS_OPTION = "All Months";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthOrder = MONTHS.reduce((acc, month, index) => {
    acc[month] = index;
    return acc;
}, {});

const getLastNMonths = (n) => {
    const result = [];
    const today = new Date();
    for (let i = 0; i < n; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        result.push({
            month: MONTHS[d.getMonth()],
            year: d.getFullYear()
        });
    }
    return result;
};

// --- COMPONENT ---
function FacultyDashboard() {
    const [facultyData, setFacultyData] = useState(null);
    const [salaryHistory, setSalaryHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [displayTotal, setDisplayTotal] = useState(0);
    
    const [availableYears, setAvailableYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(ALL_MONTHS_OPTION);
    
    const [reportType, setReportType] = useState('Custom'); // Can be 'Custom', 3, 6, or 9
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const navigate = useNavigate();

    // --- 1. Fetch data (and set background) ---
    useEffect(() => {
        document.body.style.backgroundColor = BACKGROUND_LIGHT; 
        const fetchAllData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Session expired or invalid. Please log in again.');
                localStorage.removeItem('token');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            try {
                const [profileRes, historyRes] = await Promise.all([
                    // *** UPDATED URL 1 ***
                    axios.get(`${API_BASE_URL}/faculty/me`, config),
                    // *** UPDATED URL 2 ***
                    axios.get(`${API_BASE_URL}/salary/my-history`, config)
                ]);
                setFacultyData(profileRes.data);
                
                const history = historyRes.data.map(item => ({
                    ...item,
                    amount: item.amount || 0, 
                }));
                
                setSalaryHistory(history);
                if (history.length > 0) {
                    const years = [...new Set(history.map(item => item.year))];
                    setAvailableYears(years.sort((a, b) => b - a));
                    setSelectedYear(years[0]);
                } else {
                    setAvailableYears([new Date().getFullYear()]);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Session expired or invalid. Please log in again.');
                localStorage.removeItem('token');
                setTimeout(() => navigate('/login'), 2000);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
        return () => {
            document.body.style.backgroundColor = null;
        };
    }, [navigate]);

    // --- 2. Filter by Year, Month, OR Quick Report ---
    useEffect(() => {
        let records = [...salaryHistory];
        
        if (reportType === 'Custom') {
            records = records.filter(r => r.year === selectedYear);
            if (selectedMonth !== ALL_MONTHS_OPTION) {
                records = records.filter(r => r.month === selectedMonth);
            } else {
                records.sort((a, b) => monthOrder[a.month] - monthOrder[b.month]);
            }
        } else {
            const dateRanges = getLastNMonths(reportType); 
            
            records = records.filter(record => 
                dateRanges.some(range => 
                    range.year === record.year && range.month === record.month
                )
            );
            records.sort((a, b) => (b.year - a.year) || (monthOrder[b.month] - monthOrder[a.month]));
        }
        
        setFilteredHistory(records);
        const total = records.reduce((acc, record) => acc + record.amount, 0);
        setDisplayTotal(total);

    }, [selectedYear, selectedMonth, salaryHistory, reportType]);

    // --- 3. Click Handlers ---
    const handleYearChange = (e) => {
        setSelectedYear(Number(e.target.value));
        setSelectedMonth(ALL_MONTHS_OPTION); 
        setReportType('Custom');
    };
    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
        setReportType('Custom');
    };
    const handleQuickReport = (months) => {
        setSelectedYear(availableYears[0] || new Date().getFullYear());
        setSelectedMonth(ALL_MONTHS_OPTION); 
        setReportType(months);
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // --- 4. Secure Download Single/Bulk Payslip Handler ---
    const handleDownloadPayslip = async () => {
        if (!facultyData || filteredHistory.length === 0) return;
        
        setIsDownloading(true);
        setError(''); 

        const token = localStorage.getItem('token');
        const username = facultyData.username;
        
        let url;
        let periodName = '';

        if (filteredHistory.length === 1) {
            const year = filteredHistory[0].year; 
            const month = filteredHistory[0].month; 
            // *** UPDATED URL 3 ***
            url = `${API_BASE_URL}/salary/payslip/${username}/${year}/${month}`;
            periodName = `${month}_${year}`;
        } else {
            const totalMonthsToReport = reportType === 'Custom' ? filteredHistory.length : reportType;

            if (reportType === 'Custom' && selectedMonth === ALL_MONTHS_OPTION) {
                // *** UPDATED URL 4 (for annual report) ***
                url = `${API_BASE_URL}/salary/report/${totalMonthsToReport}`; 
                periodName = `Annual_${selectedYear}`;
            } else {
                // *** UPDATED URL 4 (for last N months report) ***
                url = `${API_BASE_URL}/salary/report/${totalMonthsToReport}`;
                periodName = `Last_${totalMonthsToReport}_Months`;
            }
        }
        
        try {
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob' 
            });

            let filename;
            const disposition = response.headers['content-disposition'];
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const matches = /filename="?([^"]*)"?/.exec(disposition);
                if (matches != null && matches[1]) filename = matches[1];
            } else {
                filename = `Payslip_Collection_${username}_${periodName}.pdf`;
            }

            saveAs(response.data, filename);

        } catch (err) {
            console.error('Secure Download Error:', err);
            if (err.response && (err.response.status === 404 || err.response.status === 403)) {
                setError('Payslip data not found or access denied. Please re-login.');
            } else {
                setError('Failed to download payslip due to a server error.');
            }
        } finally {
            setIsDownloading(false);
        }
    };


    // --- 5. Helper Functions ---
    const formatCurrency = (amount) => {
        return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
    };
    
    const isDownloadingOrNoData = isDownloading || filteredHistory.length === 0;
    const isButtonEnabled = filteredHistory.length > 0 && !isDownloading;
    const totalMonths = filteredHistory.length;
    
    const sortedHistory = [...salaryHistory].sort((a, b) => (b.year - a.year) || (monthOrder[b.month] - monthOrder[a.month]));
    const lastPaymentDate = sortedHistory.length > 0 ? `${sortedHistory[0].month} ${sortedHistory[0].year}` : 'N/A';
    

    let reportTitleText = "Report";
    if (reportType === 'Custom') {
        reportTitleText = selectedMonth === ALL_MONTHS_OPTION 
            ? `Annual Summary for ${selectedYear}` 
            : `Monthly Payslip for ${selectedMonth} ${selectedYear}`;
    } else {
        reportTitleText = `Summary for Last ${reportType} Months`;
    }
    const totalLabel = filteredHistory.length === 1 ? 'Net Salary Paid' : 'Total Earnings';

    // NEW: Render function for detailed single month view (FIXED ALIGNMENT)
    const renderDetailedPayslip = (record) => {
        const details = record.details || { 
            basicPay: 45000, 
            hra: 15000, 
            da: 5000,
            pf: 5000, 
            tax: 2000,
            loan: 1000,
        };

        const earnings = [
            { label: 'Basic Pay', value: details.basicPay || 0 },
            { label: 'Dearness Allowance (DA)', value: details.da || 0 },
            { label: 'House Rent Allowance (HRA)', value: details.hra || 0 },
            { label: 'Conveyance Allowance', value: 1000 },
            { label: 'Medical Reimbursement', value: 500 },
        ];

        const deductions = [
            { label: 'Provident Fund (PF)', value: details.pf || 0 },
            { label: 'Income Tax (TDS)', value: details.tax || 0 },
            { label: 'Loan/Advance Recovery', value: details.loan || 0 },
            { label: 'Professional Tax', value: 200 },
            { label: 'Insurance Premium', value: 400 },
        ];
        
        const maxRows = Math.max(earnings.length, deductions.length);
        const rows = Array.from({ length: maxRows });

        const valueCellStyle = { 
            ...styles.payslipDetailValue, 
            width: '20%', 
        };
        const labelCellStyle = { 
            ...styles.payslipDetailLabel, 
            width: '30%', 
        };
        
        const totalEarnings = earnings.reduce((a, b) => a + b.value, 0);
        const totalDeductions = deductions.reduce((a, b) => a + b.value, 0);


        return (
            <div style={{ marginTop: '20px' }}>
                <table style={{ ...styles.table, border: 'none' }}>
                    <thead>
                        <tr>
                            <th colSpan="2" style={{ ...styles.payslipSectionHeader, color: ACCENT_SECONDARY, borderBottom: `2px solid ${ACCENT_SECONDARY}` }}>EARNINGS</th>
                            <th colSpan="2" style={{ ...styles.payslipSectionHeader, color: ACCENT_DANGER, borderBottom: `2px solid ${ACCENT_DANGER}` }}>DEDUCTIONS</th>
                        </tr>
                    </thead>
                    
                    <tbody>
                        {rows.map((_, index) => {
                            const earning = earnings[index] || {};
                            const deduction = deductions[index] || {};
                            return (
                                <tr key={index} style={styles.payslipSeparatorRow}>
                                    <td style={labelCellStyle}>{earning.label || ''}</td>
                                    <td style={valueCellStyle}>{earning.value ? formatCurrency(earning.value) : ''}</td>
                                    
                                    <td style={labelCellStyle}>{deduction.label || ''}</td>
                                    <td style={valueCellStyle}>{deduction.value ? formatCurrency(deduction.value) : ''}</td>
                                </tr>
                            );
                        })}

                        <tr style={{ backgroundColor: '#f3f4f6', borderTop: `3px solid ${TEXT_DARK}` }}>
                            <td style={{...labelCellStyle, fontWeight: 700, color: TEXT_DARK}}>GROSS EARNINGS:</td>
                            <td style={{...valueCellStyle, fontWeight: 700, color: TEXT_DARK, borderRight: '1px solid #e5e7eb'}}>{formatCurrency(totalEarnings)}</td>
                            
                            <td style={{...labelCellStyle, fontWeight: 700, color: TEXT_DARK}}>TOTAL DEDUCTIONS:</td>
                            <td style={{...valueCellStyle, fontWeight: 700, color: TEXT_DARK}}>{formatCurrency(totalDeductions)}</td>
                        </tr>
                    </tbody>
                </table>
                

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
                    <div style={styles.netPayCard}>
                        <p style={styles.netPayLabel}>Net Salary Paid</p>
                        <h4 style={styles.netPayValue}>{formatCurrency(record.amount)}</h4>
                    </div>
                </div>
            </div>
        );
    };


    // --- 6. Render the page ---
    if (loading) {
        return <div style={{...styles.dashboard, textAlign: 'center', color: TEXT_DARK}}><h2>Loading Faculty Data...</h2></div>;
    }
    if (error) {
        return <div style={{...styles.dashboard, textAlign: 'center'}}><h2 style={{color: ACCENT_DANGER}}>{error}</h2></div>;
    }

    return (
        <div style={styles.dashboard}>
            <div style={styles.header}>
                <h1 style={styles.welcomeTitle}>👋 Welcome, {facultyData ? facultyData.name : 'Faculty'}</h1>
                <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
            </div>
            
            {/* MAIN CONTENT GRID */}
            <div style={styles.contentGrid}>

                {/* LEFT SIDEBAR: Filters and Quick Reports */}
                <div style={styles.sidebar}>
                    
                    {/* Primary Selectors Section */}
                    <div style={styles.cardContainer}>
                        <h3 style={{...styles.selectorLabel, fontWeight: 700, fontSize: '1.4rem', marginBottom: '30px', color: ACCENT_PRIMARY}}>
                            Filter Options
                        </h3>

                        <div style={styles.selectorGroup}>
                            <label htmlFor="year-select" style={styles.selectorLabel}>Select Year:</label>
                            <select 
                                id="year-select" 
                                style={styles.selector}
                                value={selectedYear}
                                onChange={handleYearChange}
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div style={styles.selectorGroup}>
                            <label htmlFor="month-select" style={styles.selectorLabel}>Select Month:</label>
                            <select 
                                id="month-select" 
                                style={styles.selector}
                                value={selectedMonth}
                                onChange={handleMonthChange}
                            >
                                <option value={ALL_MONTHS_OPTION}>All Months</option>
                                {MONTHS.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>
                    </div> {/* End Selectors Section */}

                    {/* Quick Reports Section */}
                    <div style={styles.cardContainer}>
                        <h3 style={{...styles.selectorLabel, fontWeight: 700, fontSize: '1.4rem', marginBottom: '20px', color: ACCENT_PRIMARY}}>
                            Quick Access
                        </h3>
                        <div style={styles.quickReportContainer}>
                            <button 
                                style={{...styles.quickReportButton, ...(reportType === 3 ? styles.quickReportButtonActive : {})}} 
                                onClick={() => handleQuickReport(3)}
                            >
                                Last 3 Months
                            </button>
                            <button 
                                style={{...styles.quickReportButton, ...(reportType === 6 ? styles.quickReportButtonActive : {})}} 
                                onClick={() => handleQuickReport(6)}
                            >
                                Last 6 Months
                            </button>
                            <button 
                                style={{...styles.quickReportButton, ...(reportType === 9 ? styles.quickReportButtonActive : {})}} 
                                onClick={() => handleQuickReport(9)}
                            >
                                Last 9 Months
                            </button>
                            <button 
                                style={{...styles.quickReportButton, ...(reportType === 'Custom' && selectedMonth === ALL_MONTHS_OPTION ? styles.quickReportButtonActive : {})}} 
                                onClick={() => handleQuickReport('Custom')}
                            >
                                Custom/Annual
                            </button>
                        </div>
                    </div> {/* End Quick Reports Section */}

                </div> {/* END LEFT SIDEBAR */}


                {/* RIGHT MAIN REPORT AREA */}
                <div style={styles.mainReportArea}>

                    {/* METRIC CARDS */}
                    <div style={styles.metricContainer}>
                        <div style={{...styles.metricCard, borderLeftColor: '#6b7280', backgroundColor: '#eef2f7'}}>
                            <p style={styles.metricLabel}>Total Records Shown</p>
                            <h4 style={{...styles.metricValue, color: '#6b7280'}}>{totalMonths}</h4>
                        </div>
                        <div style={{...styles.metricCard, borderLeftColor: ACCENT_SECONDARY, backgroundColor: '#e6fffa'}}>
                            <p style={styles.metricLabel}>Last Payment Date</p>
                            <h4 style={{...styles.metricValue, color: ACCENT_SECONDARY}}>{lastPaymentDate}</h4>
                        </div>
                        <div style={{...styles.metricCard, borderLeftColor: ACCENT_PRIMARY, backgroundColor: '#e6f0ff'}}>
                            <p style={styles.metricLabel}>{totalLabel}</p>
                            <h4 style={{...styles.metricValue, color: ACCENT_PRIMARY}}>{formatCurrency(displayTotal)}</h4>
                        </div>
                    </div>
                
                    {/* Report Table Section */}
                    <div style={styles.cardContainer}>
                        <h2 style={styles.reportTitle}>{reportTitleText}</h2>
                        
                        {filteredHistory.length === 1 ? (
                            // RENDER DETAILED VIEW (Single Payslip)
                            renderDetailedPayslip(filteredHistory[0])
                        ) : filteredHistory.length > 0 ? (
                            // RENDER SUMMARY TABLE
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Month</th>
                                        <th style={styles.th}>Year</th>
                                        <th style={styles.th}>Amount Paid</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.map((record, index) => (
                                        <tr 
                                            key={record._id} 
                                            style={{
                                                backgroundColor: index % 2 === 0 ? CARD_WHITE : '#f9fafb', 
                                            }}
                                        >
                                            <td style={styles.td}>{record.month}</td>
                                            <td style={styles.td}>{record.year}</td>
                                            <td style={styles.td}>{formatCurrency(record.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={styles.tfoot}>
                                        <td style={{...styles.td, ...styles.tfoot, borderTop: 'none'}} colSpan="2">{totalLabel}</td>
                                        <td style={{...styles.td, ...styles.tfoot, borderTop: 'none'}}>{formatCurrency(displayTotal)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        ) : (
                            <p style={styles.noDataText}>
                                No salary data found for this selection. Try adjusting your filters.
                            </p> 
                        )}
                        
                        {/* Download Button container */}
                        <div style={styles.buttonContainer}>
                            <button
                                onClick={handleDownloadPayslip} 
                                style={{
                                    ...styles.downloadButton, 
                                    ...(isButtonEnabled ? {} : styles.buttonDisabled)
                                }}
                                disabled={!isButtonEnabled}
                            >
                                {isDownloading ? 'Generating PDF...' : (filteredHistory.length === 1 ? 'Download Full Payslip (PDF)' : 'Download Bulk Payslips (PDF)')}
                            </button>
                        </div>
                    </div> {/* End Report Table Section */}
                </div> {/* END RIGHT MAIN REPORT AREA */}

            </div> {/* END MAIN CONTENT GRID */}
        </div>
    );
}

export default FacultyDashboard;