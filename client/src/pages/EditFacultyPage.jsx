import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

// (Using the same styles as AddFacultyPage)
const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxWidth: '400px',
  },
  input: { padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' },
  button: { padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  backButton: { textDecoration: 'none', color: '#007bff', marginTop: '10px' },
  message: { padding: '10px', marginTop: '10px', borderRadius: '4px' },
  success: { backgroundColor: '#d4edda', color: '#155724' },
  error: { backgroundColor: '#f8d7da', color: '#721c24' },
};

function EditFacultyPage() {
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    name: '',
    department: '',    
    designation: '',   
    baseSalary: 0      
  });
  const [message, setMessage] = useState({ type: '', content: '' });
  const navigate = useNavigate();
  const { id } = useParams(); 

  // --- 1. Fetch this faculty's data on page load ---
  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/faculty/${id}`);
        // Destructure all six fields from the response data
        const { name, username, password, department, designation, baseSalary } = response.data;
        
        setFormData({ 
            name: name || '', 
            username: username || '', 
            password: password || '',
            department: department || '',
            designation: designation || '',
            baseSalary: baseSalary || 0
        });
      } catch (err) {
        console.error('Error fetching faculty data:', err);
        setMessage({ type: 'error', content: 'Could not load faculty data.' });
      }
    };
    fetchFacultyData();
  }, [id]); 

  // --- 2. Handle form input changes ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
        ...prev, 
        [name]: name === 'baseSalary' ? Number(value) : value 
    }));
  };

  // --- 3. Handle the UPDATE submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });

    try {
      await axios.put(`http://localhost:8000/api/faculty/${id}`, formData);
      setMessage({ type: 'success', content: 'Faculty updated successfully! Redirecting...' });
      
      // A slight delay before navigation ensures the success message is seen.
      // When the AdminDashboard re-renders, its useEffect hook will run
      // and call fetchFaculty, fetching the latest data.
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An error occurred during update.';
      setMessage({ type: 'error', content: errorMsg });
    }
  };

  return (
    <div style={styles.container}>
      <h2>Edit Faculty</h2>
      <a href="/admin/dashboard" style={styles.backButton}>&larr; Back to Dashboard</a>
      
      {message.content && (
        <div style={{ ...styles.message, ...(message.type === 'success' ? styles.success : styles.error) }}>
          {message.content}
        </div>
      )}

      {/* --- Edit Faculty Form (Updated) --- */}
      <form onSubmit={handleSubmit} style={{...styles.form, marginTop: '20px'}}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleFormChange}
          style={styles.input}
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Faculty ID (Username)"
          value={formData.username}
          onChange={handleFormChange}
          style={styles.input}
          required
        />
        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleFormChange}
          style={styles.input}
          required
        />
        <input
          type="text"
          name="designation"
          placeholder="Designation"
          value={formData.designation}
          onChange={handleFormChange}
          style={styles.input}
          required
        />
        <input
          type="number"
          name="baseSalary"
          placeholder="Base Salary (INR)"
          value={formData.baseSalary}
          onChange={handleFormChange}
          style={styles.input}
          required
        />
        <input
          type="text"
          name="password"
          placeholder="Password / DOB (Changes Password)"
          value={formData.password}
          onChange={handleFormChange}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          Update Faculty
        </button>
      </form>
    </div>
  );
}

export default EditFacultyPage;