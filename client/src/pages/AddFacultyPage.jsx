import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Simple styles (can be moved to a CSS file)
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

function AddFacultyPage() {
  // Initialize state with all six fields
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    name: '',
    department: '',    // ADDED
    designation: '',   // ADDED
    baseSalary: ''     // ADDED
  });
  const [message, setMessage] = useState({ type: '', content: '' });
  const navigate = useNavigate();

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      // Convert baseSalary to a number before saving to state
      [name]: name === 'baseSalary' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });

    // The backend route (POST /api/faculty) must be ready to accept all 6 fields.
    try {
      // Data sent to the server includes all fields from formData
      await axios.post('http://localhost:8000/api/faculty', formData);
      setMessage({ type: 'success', content: 'Faculty added successfully!' });
      
      // Navigate back to the dashboard after a short delay
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An error occurred.';
      setMessage({ type: 'error', content: errorMsg });
    }
  };

  return (
    <div style={styles.container}>
      <h2>Add New Faculty</h2>
      <a href="/admin/dashboard" style={styles.backButton}>&larr; Back to Dashboard</a>
      
      {/* --- Message Display --- */}
      {message.content && (
        <div style={{ ...styles.message, ...(message.type === 'success' ? styles.success : styles.error) }}>
          {message.content}
        </div>
      )}

      {/* --- Add Faculty Form (Updated) --- */}
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
        
        {/* New Fields Added */}
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
          placeholder="Password / DOB"
          value={formData.password}
          onChange={handleFormChange}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          Add Faculty
        </button>
      </form>
    </div>
  );
}

export default AddFacultyPage;