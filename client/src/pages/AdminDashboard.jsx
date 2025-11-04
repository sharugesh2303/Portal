import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { saveAs } from 'file-saver'; 

// --- (STYLES - unchanged) ---
const styles = {
  dashboard: {
    maxWidth: '960px',
    margin: '40px auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #eee',
    paddingBottom: '20px',
    marginBottom: '30px',
  },
  welcomeTitle: {
    fontSize: '2.5rem',
    color: '#2c3e50',
    margin: 0,
  },
  logoutButton: {
    padding: '10px 18px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  controlPanel: {
    display: 'flex',
    gap: '10px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  controlButton: {
    padding: '10px 15px',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'opacity 0.2s',
  },
  detailsButton: {
    backgroundColor: '#3498db', // Blue
  },
  salaryButton: {
    backgroundColor: '#1abc9c', // Teal
  },
  addButton: {
    backgroundColor: '#2ecc71', // Green
    marginLeft: 'auto',
  },
  section: {
    marginTop: '20px',
    padding: '30px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: '2rem',
    color: '#2c3e50',
    margin: '0 0 20px 0',
    borderBottom: '2px solid #eee',
    paddingBottom: '15px',
  },
  input: { padding: '8px 12px', fontSize: '1rem', borderRadius: '5px', border: '1px solid #ccc' },
  button: {
    padding: '10px 15px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  table: { width: '100%', marginTop: '20px', borderCollapse: 'collapse' },
  th: {
    borderBottom: '2px solid #ddd',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    textAlign: 'left',
    color: '#34495e',
    textTransform: 'uppercase',
    fontSize: '0.9rem',
  },
  td: {
    borderBottom: '1px solid #eee',
    padding: '15px',
    color: '#333',
  },
  message: { padding: '10px', marginTop: '20px', borderRadius: '5px', fontSize: '1rem' },
  success: { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
  error: { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
  loading: {
      backgroundColor: '#fff3cd', 
      color: '#856404', 
      border: '1px solid #ffeeba',
      padding: '10px', 
      marginTop: '20px',
      borderRadius: '5px'
  },
  salaryUploadContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
  selectorRow: { display: 'flex', gap: '10px', alignItems: 'center' },
  selector: { padding: '8px 12px', fontSize: '1rem', borderRadius: '5px', border: '1px solid #ccc' },
  fileUploadRow: { display: 'flex', gap: '10px', alignItems: 'center' },
  actionCell: { display: 'flex', gap: '5px', alignItems: 'center' },
  actionButton: {
    padding: '5px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'white',
    textDecoration: 'none',
    display: 'inline-block',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  editButton: {
    backgroundColor: '#f39c12',
  },
  yearRow: {
    backgroundColor: '#f4f7f6',
    borderTop: '2px solid #ddd',
  },
  yearCell: {
    padding: '15px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  monthCell: {
    paddingLeft: '40px',
  },
  summaryReportContainer: {
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee',
  },
  summaryTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: '10px',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  summaryLabel: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#333',
    width: '120px', 
  },
  directDownloadButton: {
    padding: '8px 12px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: '#3498db',
    marginLeft: '10px',
  }
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthOrder = MONTHS.reduce((acc, month, index) => {
  acc[month] = index;
  return acc;
}, {});

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => currentYear - 1 + i);

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
    document.body.style.backgroundColor = '#f4f7f6';
    return () => {
      document.body.style.backgroundColor = null;
    };
  }, []);

  const fetchFaculty = async () => { 
    setMessage({ type: 'loading', content: 'Loading faculty list...' });
    try {
      const response = await axios.get('http://localhost:8000/api/faculty'); 
      setFacultyList(response.data);
      setMessage({ type: 'success', content: 'Faculty list loaded successfully.' });
    } catch (error) {
      console.error('Error fetching faculty:', error);
      setMessage({ type: 'error', content: 'Could not load faculty data.' });
    }
  };
  
  const fetchSalaryHistory = async () => { 
    try {
      const response = await axios.get('http://localhost:8000/api/salary/history');
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

  // --- NEW: Admin Secure Bulk Report Handler (FIX for "not authorized") ---
  const handleAdminBulkReport = async (months) => {
    const token = localStorage.getItem('token');
    if (!token) {
        setMessage({ type: 'error', content: 'Not logged in. Please refresh and log in.' });
        return;
    }

    const reportUrl = `http://localhost:8000/api/salary/report/${months}`;
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


  // --- NEW: Direct Download Handler for Admin Monthly/Annual Reports (PDF ONLY) ---
  const handleDirectDownload = async (endpoint, param) => {
    const token = localStorage.getItem('token');
    if (!token) {
        setMessage({ type: 'error', content: 'Authorization token missing. Please log in again.' });
        return;
    }
    
    const url = `http://localhost:8000/api/salary/${endpoint}/${param}`;
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


  // --- (Upload Handlers - Unchanged) ---
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
      const response = await axios.post('http://localhost:8000/api/salary/upload-faculty', uploadData);
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
      const response = await axios.post('http://localhost:8000/api/salary/upload-monthly', uploadData);
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
  
  // --- (Action Handlers - Unchanged) ---
  const handleLogout = () => { 
    navigate('/login'); 
  };
  const toggleDetails = () => { 
      setMessage({ type: '', content: '' });
      setShowDetailsUpload(!showDetailsUpload); 
      setShowSalaryUpload(false); 
  };
  const toggleSalary = () => { 
      setSalaryMessage({ type: '', content: '' });
      setShowSalaryUpload(!showSalaryUpload); 
      setShowDetailsUpload(false); 
  };
  
  const handleDeleteFaculty = async (facultyId) => { 
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
        try {
          setMessage({ type: 'loading', content: 'Deleting faculty member...' });
          await axios.delete(`http://localhost:8000/api/faculty/${facultyId}`); 
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
        const response = await axios.delete(`http://localhost:8000/api/salary/history/${year}/${month}`);
        setSalaryMessage({ type: 'success', content: response.data.message });
        fetchSalaryHistory();
      } catch (error) {
        setSalaryMessage({ type: 'error', content: error.response?.data?.message || 'Delete failed.' });
      }
    }
  };

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>
        <h1 style={styles.welcomeTitle}>Admin Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </div>
      <p style={{fontSize: '1.1rem', color: '#555'}}>Manage faculty details and upload in bulk.</p>

      <div style={styles.controlPanel}>
        <button onClick={toggleDetails} style={{...styles.controlButton, ...styles.detailsButton}}>
          {showDetailsUpload ? 'Hide' : 'Show'} Faculty Details
        </button>
        <button onClick={toggleSalary} style={{...styles.controlButton, ...styles.salaryButton}}>
          {showSalaryUpload ? 'Hide' : 'Show'} Faculty Salaries
        </button>
        <Link to="/admin/add-faculty" style={{...styles.controlButton, ...styles.addButton}}>
          + Add New Faculty
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


      {/* --- (SECTION 1) FACULTY DETAILS --- */}
      {showDetailsUpload && (
        <>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Bulk Add or Update Faculty Details</h2>
            <p>Upload a CSV file with all required columns: <strong>name, username, password, department, designation, baseSalary</strong></p>
            <div style={{display: 'flex', gap: '10px'}}>
              <input type="file" accept=".csv" onChange={handleFileChange} style={styles.input} />
              <button onClick={handleCsvUpload} style={styles.button}>Upload Details</button>
            </div>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Faculty List</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Faculty ID (Username)</th>
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

      {/* --- (SECTION 2) FACULTY SALARIES --- */}
      {showSalaryUpload && (
        <>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Bulk Upload Faculty Salaries</h2>
            <p>Select month and year, then upload a CSV with columns: <strong>username, basic, hra, da, ... (detailed components)</strong></p>
            <div style={styles.salaryUploadContainer}>
              <div style={styles.selectorRow}>
                <label htmlFor="year-select">Year:</label>
                <select id="year-select" style={styles.selector} value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                  {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
                <label htmlFor="month-select" style={{marginLeft: '15px'}}>Month:</label>
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
            <h2 style={styles.sectionTitle}>Salary Upload History</h2>
            
            {/* --- ADMIN BULK REPORT CONTROLS (SECURE) --- */}
            <div style={styles.summaryReportContainer}>
              <h3 style={styles.summaryTitle}>Admin Bulk Payslip Download (Multi-Page PDF)</h3>
              
              <div style={styles.summaryItem}>
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
                    style={{...styles.controlButton, backgroundColor: '#007bff'}}
                >
                    Download Bulk PDF
                </button>
              </div>

            </div>
            {/* --- END ADMIN BULK CONTROLS --- */}


            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Year / Month</th>
                  <th style={styles.th}>Faculty Records</th>
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