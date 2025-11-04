import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver'; 

// --- STYLES - FINAL ATTRACTIVE & INNOVATIVE BRIGHT THEME ---
const TEXT_DARK = '#2C3E50'; 
const BACKGROUND_LIGHT = '#F4F7F9'; 
const CARD_WHITE = '#FFFFFF';      
const ACCENT_PRIMARY = '#007BFF';  
const ACCENT_SECONDARY = '#17A2B8'; 
const ACCENT_DANGER = '#DC3545'; 
const ACCENT_SUCCESS = '#28A745'; // Green for Net Pay/Success

const styles = {
    dashboard: {
        maxWidth: '1400px', 
        margin: '50px auto',
        padding: '30px',
        fontFamily: 'Inter, sans-serif', 
        color: TEXT_DARK,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '30px',
        marginBottom: '40px',
        borderBottom: `1px solid #E9ECEF`, 
    },
    welcomeTitle: {
        fontSize: '2.8rem',
        color: TEXT_DARK, 
        margin: 0,
        fontWeight: 600, 
    },
    logoutButton: {
        padding: '12px 24px',
        backgroundColor: ACCENT_DANGER,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        transition: 'background-color 0.3s',
        boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)', // Subtle shadow
    },
    // Main content area uses Flexbox
    contentGrid: {
        display: 'flex',
        border: `1px solid #E9ECEF`, 
        borderRadius: '12px',
        overflow: 'hidden', 
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)', // Deeper shadow for "floating" effect
        backgroundColor: CARD_WHITE,
    },
    // LEFT SIDEBAR: Geometric shape and clear color
    sidebar: {
        flex: '0 0 350px', 
        padding: '40px 30px',
        backgroundColor: '#F7F9FB', 
        borderTopLeftRadius: '12px', 
        borderBottomLeftRadius: '12px',
        borderRight: `2px solid #E0E0E0`, 
        display: 'flex',
        flexDirection: 'column',
        gap: '40px', 
    },
    // RIGHT MAIN REPORT AREA
    mainReportArea: {
        flex: 1, 
        padding: '40px',
    },
    
    // Metric Cards Container
    metricContainer: {
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        borderBottom: `1px dashed #E9ECEF`,
        paddingBottom: '20px',
    },
    metricCard: {
        backgroundColor: '#E6F3FF', 
        padding: '18px 25px', // More padding
        borderRadius: '8px',
        flex: 1,
        textAlign: 'left',
        borderLeft: `5px solid ${ACCENT_PRIMARY}`, 
        transition: 'transform 0.2s', // Hover effect
        // '&:hover': { transform: 'translateY(-2px)' } // Needs CSS module or external sheet to apply properly
    },
    metricLabel: {
        fontSize: '0.9rem',
        color: '#6C757D',
        fontWeight: 500,
        textTransform: 'uppercase',
    },
    metricValue: {
        fontSize: '1.9rem', // Slightly larger value
        color: ACCENT_PRIMARY,
        fontWeight: 700,
        marginTop: '5px',
    },

    selectorGroup: {
        width: '100%',
    },
    selectorLabel: {
        fontSize: '1rem',
        fontWeight: 600,
        color: TEXT_DARK, 
        marginBottom: '8px',
        display: 'block',
    },
    selector: {
        padding: '10px 15px',
        fontSize: '1rem',
        borderRadius: '8px',
        border: `1px solid #CCC`,
        backgroundColor: CARD_WHITE, 
        color: TEXT_DARK,
        width: '100%', 
        transition: 'border-color 0.3s',
    },
    quickReportContainer: {
        paddingTop: '0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
    },
    quickReportButton: {
        padding: '8px 15px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        color: ACCENT_SECONDARY, 
        borderRadius: '20px', 
        backgroundColor: 'transparent',
        border: `1px solid ${ACCENT_SECONDARY}`, 
        cursor: 'pointer',
        transition: 'background-color 0.3s, color 0.3s',
    },
    buttonContainer: {
        display: 'flex',
        gap: '20px',
        marginTop: '30px',
        justifyContent: 'flex-end', 
    },
    downloadButton: { 
        padding: '15px 30px', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontSize: '1rem', 
        fontWeight: 'bold', 
        transition: 'background-color 0.3s, opacity 0.2s, transform 0.2s',
        backgroundColor: ACCENT_PRIMARY,
        boxShadow: '0 4px 10px rgba(0, 123, 255, 0.4)', 
        // '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 12px rgba(0, 123, 255, 0.6)'} // Needs CSS Module
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        boxShadow: 'none',
    },
    
    reportTitle: {
        textAlign: 'left',
        paddingBottom: '15px',
        marginBottom: '20px',
        fontSize: '2rem',
        color: TEXT_DARK, 
        fontWeight: 600,
        borderBottom: `2px solid ${ACCENT_PRIMARY}`, 
        width: '20%', 
    },
    table: { 
        width: '100%', 
        borderCollapse: 'collapse', 
    },
    th: {
        padding: '15px',
        textAlign: 'left',
        color: ACCENT_PRIMARY, 
        textTransform: 'uppercase',
        fontSize: '0.9rem',
        fontWeight: 500,
        borderBottom: `2px solid #EEE`, 
        backgroundColor: '#F7F9FB', 
    },
    td: {
        padding: '15px',
        backgroundColor: CARD_WHITE,
        color: TEXT_DARK,
        borderBottom: `1px solid #F0F0F0`, 
    },
    tfoot: {
        fontWeight: 'bold',
        borderTop: `2px solid ${ACCENT_PRIMARY}`, 
        color: ACCENT_PRIMARY,
        fontSize: '1.2rem',
        backgroundColor: '#E6F3FF',
    },
    noDataText: {
        textAlign: 'center',
        fontSize: '1.2rem',
        color: '#999',
        padding: '40px 0',
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
  
  const [reportType, setReportType] = useState('Custom');
  
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
          axios.get('http://localhost:8000/api/faculty/me', config),
          axios.get('http://localhost:8000/api/salary/my-history', config)
        ]);
        setFacultyData(profileRes.data);
        setSalaryHistory(historyRes.data);
        if (historyRes.data.length > 0) {
          const years = [...new Set(historyRes.data.map(item => item.year))];
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
    let records = [];
    
    if (reportType === 'Custom') {
      records = salaryHistory.filter(r => r.year === selectedYear);
      if (selectedMonth !== ALL_MONTHS_OPTION) {
        records = records.filter(r => r.month === selectedMonth);
      } else {
        records.sort((a, b) => monthOrder[a.month] - monthOrder[b.month]);
      }
    } else {
      const dateRanges = getLastNMonths(reportType); 
      
      records = salaryHistory.filter(record => 
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
        url = `http://localhost:8000/api/salary/payslip/${username}/${year}/${month}`;
        periodName = `${month}_${year}`;
    } else {
        if (reportType === 'Custom') {
             const monthCount = filteredHistory.length > 12 ? 24 : 12; 
             url = `http://localhost:8000/api/salary/report/${monthCount}`;
             periodName = `All_${selectedYear}`;
        } else {
             url = `http://localhost:8000/api/salary/report/${reportType}`;
             periodName = `Last_${reportType}_Months`;
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
  const lastPaymentDate = filteredHistory.length > 0 ? `${filteredHistory[0].month} ${filteredHistory[0].year}` : 'N/A';
  

  let reportTitleText = "Report";
  if (reportType === 'Custom') {
    reportTitleText = selectedMonth === ALL_MONTHS_OPTION 
      ? `Annual Summary for ${selectedYear}` 
      : `Report for ${selectedMonth} ${selectedYear}`;
  } else {
    reportTitleText = `Summary for Last ${reportType} Months`;
  }
  const totalLabel = filteredHistory.length === 1 ? 'Month Total' : 'Total Earnings';

  // NEW: Render function for detailed single month view (FIXED ALIGNMENT)
  const renderDetailedPayslip = (record) => {
    // PLACEHOLDER: Define your expected payslip fields here based on your API structure.
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

    // Custom style for the fixed alignment cells
    const valueCellStyle = { 
        ...styles.td, 
        backgroundColor: CARD_WHITE, 
        textAlign: 'right', 
        width: '20%', 
        fontWeight: 600,
    };
    const labelCellStyle = { 
        ...styles.td, 
        backgroundColor: CARD_WHITE, 
        fontWeight: 500, 
        width: '30%', 
    };
    const separatorStyle = { borderBottom: `1px dashed #E9ECEF` }; 
    
    const totalEarnings = earnings.reduce((a, b) => a + b.value, 0);
    const totalDeductions = deductions.reduce((a, b) => a + b.value, 0);


    return (
      <div style={{ marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {/* Table Headers */}
            <thead>
                <tr>
                    <th colSpan="2" style={{ ...styles.th, color: ACCENT_SECONDARY, borderBottom: `2px solid ${ACCENT_SECONDARY}` }}>EARNINGS</th>
                    <th colSpan="2" style={{ ...styles.th, color: ACCENT_DANGER, borderBottom: `2px solid ${ACCENT_DANGER}` }}>DEDUCTIONS</th>
                </tr>
            </thead>
            
            {/* Dynamic Content Rows */}
            <tbody>
                {rows.map((_, index) => {
                    const earning = earnings[index] || {};
                    const deduction = deductions[index] || {};
                    return (
                        <tr key={index} style={separatorStyle}>
                            <td style={labelCellStyle}>{earning.label || ''}</td>
                            <td style={valueCellStyle}>{earning.value ? formatCurrency(earning.value) : ''}</td>
                            
                            <td style={labelCellStyle}>{deduction.label || ''}</td>
                            <td style={valueCellStyle}>{deduction.value ? formatCurrency(deduction.value) : ''}</td>
                        </tr>
                    );
                })}

                {/* Total Row (Fixed at the bottom) */}
                <tr style={{ backgroundColor: '#F7F9FB', borderTop: `3px solid ${ACCENT_PRIMARY}` }}>
                    <td style={{...labelCellStyle, fontWeight: 700, color: TEXT_DARK}}>GROSS EARNINGS:</td>
                    <td style={{...valueCellStyle, fontWeight: 700, color: TEXT_DARK, borderRight: '1px solid #E9ECEF'}}>{formatCurrency(totalEarnings)}</td>
                    
                    <td style={{...labelCellStyle, fontWeight: 700, color: TEXT_DARK}}>TOTAL DEDUCTIONS:</td>
                    <td style={{...valueCellStyle, fontWeight: 700, color: TEXT_DARK}}>{formatCurrency(totalDeductions)}</td>
                </tr>
            </tbody>
        </table>
        

        {/* Net Pay Total Card (Kept separate for visual impact) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
            <div style={{...styles.metricCard, borderLeft: '5px solid #28A745', backgroundColor: '#EFFFF2', flex: '0 0 45%'}}>
                <p style={styles.metricLabel}>Net Salary Paid</p>
                <h4 style={{...styles.metricValue, color: ACCENT_SUCCESS}}>{formatCurrency(record.amount)}</h4>
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
        <h1 style={styles.welcomeTitle}>Welcome, {facultyData ? facultyData.name : 'Faculty'}</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </div>
      
      {/* MAIN CONTENT GRID */}
      <div style={styles.contentGrid}>

        {/* LEFT SIDEBAR: Filters and Quick Reports */}
        <div style={styles.sidebar}>
          
          {/* Primary Selectors Section */}
          <div style={styles.cardContainer}>
            <h3 style={{...styles.selectorLabel, color: TEXT_DARK, fontWeight: 700, fontSize: '1.3rem', marginBottom: '30px'}}>
                Filter Options
            </h3>

            <div style={styles.selectorRow}>
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
            </div>
          </div> {/* End Selectors Section */}

            {/* Quick Reports Section */}
            <div style={styles.cardContainer}>
                <h3 style={{...styles.selectorLabel, color: TEXT_DARK, fontWeight: 700, fontSize: '1.3rem', marginBottom: '20px'}}>
                    Quick Access
                </h3>
                <div style={styles.quickReportContainer}>
                    <button 
                        style={styles.quickReportButton} 
                        onClick={() => handleQuickReport(3)}
                    >
                        Last 3 Months
                    </button>
                    <button 
                        style={styles.quickReportButton} 
                        onClick={() => handleQuickReport(6)}
                    >
                        Last 6 Months
                    </button>
                    <button 
                        style={styles.quickReportButton} 
                        onClick={() => handleQuickReport(9)}
                    >
                        Last 9 Months
                    </button>
                </div>
            </div> {/* End Quick Reports Section */}

        </div> {/* END LEFT SIDEBAR */}


        {/* RIGHT MAIN REPORT AREA */}
        <div style={styles.mainReportArea}>

            {/* METRIC CARDS */}
            <div style={styles.metricContainer}>
                <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>Total Records Shown</p>
                    <h4 style={styles.metricValue}>{totalMonths}</h4>
                </div>
                <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>Last Payment Date</p>
                    <h4 style={styles.metricValue}>{lastPaymentDate}</h4>
                </div>
                <div style={{...styles.metricCard, borderLeft: `5px solid ${ACCENT_PRIMARY}`, backgroundColor: '#F0F5FF'}}>
                    <p style={styles.metricLabel}>{totalLabel}</p>
                    <h4 style={{...styles.metricValue, color: ACCENT_PRIMARY}}>{formatCurrency(displayTotal)}</h4>
                </div>
            </div>
          
          {/* Report Table Section */}
          <div style={styles.cardContainer}>
            <h2 style={styles.reportTitle}>{reportTitleText}</h2>
            
            {filteredHistory.length === 1 ? (
                // RENDER DETAILED VIEW (FIXED ALIGNMENT)
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
                                    backgroundColor: index % 2 === 0 ? CARD_WHITE : '#F9F9F9', 
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
                    ...styles.payslipButton, 
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