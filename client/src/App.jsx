import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AddFacultyPage from './pages/AddFacultyPage';   // <-- NEW
import EditFacultyPage from './pages/EditFacultyPage'; // <-- NEW

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/add-faculty" element={<AddFacultyPage />} />     {/* <-- NEW */}
        <Route path="/admin/edit-faculty/:id" element={<EditFacultyPage />} /> {/* <-- NEW */}

        {/* Faculty Routes */}
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;