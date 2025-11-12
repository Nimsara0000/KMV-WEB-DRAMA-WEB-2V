// frontend/src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

// 🛑 BASE URL එක ඔබගේ Render URL එකට සකස් කර ඇත
const BASE_URL = 'https://kmv-web-drama-web-2v.onrender.com'; 

// Socket.io connection
const socket = io(BASE_URL); 

const GRADES = ['6 ශ්‍රේණිය', '7 ශ්‍රේණිය', '8 ශ්‍රේණිය', '9 ශ්‍රේණිය', '10 ශ්‍රේණිය', '11 ශ්‍රේණිය'];

const initialStudentState = {
    fullName: '',
    dateOfBirth: '', 
    grade: GRADES[0],
    parentNameFather: '',
    parentNameMother: '',
    contactNumber: '',
    studentPhoto: '', 
    notes: ''
};

const AdminDashboard = ({ onLogout }) => {
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState(initialStudentState);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Initial Data Fetch and Real-time Listener
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // Axios call to the deployed backend
                const res = await axios.get(`${BASE_URL}/api/students`); 
                setStudents(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching students:', err);
            }
        };
        
        fetchStudents();
        
        // Listen for real-time updates from the server
        socket.on('students_updated', (updatedStudents) => {
            console.log('Real-time data received and updating local state.');
            setStudents(updatedStudents);
        });

        // Cleanup function
        return () => {
            socket.off('students_updated');
        };
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 2. Handle Form Submission (Create or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSend = { ...formData };

        try {
            if (isEditing) {
                // UPDATE operation (PUT)
                await axios.put(`${BASE_URL}/api/students/${editingId}`, dataToSend); 
                alert('Student data updated successfully! (Real-time update triggered)');
            } else {
                // CREATE operation (POST)
                await axios.post(`${BASE_URL}/api/students`, dataToSend); 
                alert('Student registered successfully! (Real-time update triggered)');
            }
            
            resetForm();
            
        } catch (err) {
            console.error('Submission Error:', err.response?.data || err.message);
            alert(`Error during submission: ${err.response?.data?.msg || 'Check console.'}`);
        }
    };

    // Reset Form Utility
    const resetForm = () => {
        setFormData(initialStudentState);
        setIsEditing(false);
        setEditingId(null);
    };

    // Set up form for editing an existing student
    const startEdit = (student) => {
        const dobString = student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().substring(0, 10) : '';

        setFormData({ 
            ...student,
            dateOfBirth: dobString 
        });
        setEditingId(student._id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 3. Handle Deletion
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to PERMANENTLY delete this student record?')) {
            try {
                // DELETE operation
                await axios.delete(`${BASE_URL}/api/students/${id}`); 
                alert('Student removed successfully! (Real-time update triggered)');
                if (editingId === id) {
                    resetForm();
                }
            } catch (err) {
                console.error('Deletion Error:', err.response?.data || err.message);
                alert('Error deleting student.');
            }
        }
    };
    
    // Authorization Check
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
        return <p>🔒 Access Denied. Please log in as admin.</p>;
    }

    if (loading) return <div>Loading Admin Panel...</div>;

    return (
        <div style={styles.container}>
            <h1>📝 Admin Registration Dashboard</h1>
            <button onClick={onLogout} style={styles.logoutButton}>Logout</button>
            
            <div style={styles.formSection}>
                <h2>{isEditing ? '✏️ Edit Student Details' : '➕ Register New Student'}</h2>
                <form onSubmit={handleSubmit} style={styles.formContainer}>
                    
                    {/* Input Fields (same as before) */}
                    <label>Full Name:</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    
                    <label>Date of Birth:</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                    
                    <label>Grade:</label>
                    <select name="grade" value={formData.grade} onChange={handleChange} required>
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>

                    <label>Father's Name:</label>
                    <input type="text" name="parentNameFather" value={formData.parentNameFather} onChange={handleChange} required />
                    <label>Mother's Name:</label>
                    <input type="text" name="parentNameMother" value={formData.parentNameMother} onChange={handleChange} required />
                    
                    <label>Contact Number:</label>
                    <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required />
                    
                    <label>Student Photo URL:</label> 
                    <input type="text" name="studentPhoto" value={formData.studentPhoto} onChange={handleChange} />
                    
                    <label>Notes:</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange}></textarea>
                    
                    <button type="submit" style={isEditing ? styles.updateButton : styles.submitButton}>
                        {isEditing ? 'Update Details' : 'Register Student'}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={resetForm} style={styles.cancelButton}>
                            Cancel Edit
                        </button>
                    )}
                </form>
            </div>

            <hr style={{ margin: '40px 0', border: '1px dashed #ccc' }} />

            {/* --- Student List for Editing/Deleting (same as before) --- */}
            <h2>📋 Current Registered Students</h2>
            <div style={styles.studentList}>
                {students.map(student => (
                    <div key={student._id} style={styles.studentItem}>
                        <img src={student.studentPhoto || 'https://via.placeholder.com/50?text=P'} alt={student.fullName} style={styles.photo} />
                        <div style={styles.details}>
                            <strong>{student.fullName}</strong> - {student.grade}
                            <p style={{margin: 0, fontSize: '0.9em', color: '#555'}}>Contact: {student.contactNumber}</p>
                        </div>
                        <div style={styles.actions}>
                            <button onClick={() => startEdit(student)} style={styles.editButton}>Edit</button>
                            <button onClick={() => handleDelete(student._id)} style={styles.deleteButton}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Basic Styling (same as before)
const styles = {
    container: { padding: '20px', position: 'relative' },
    logoutButton: { position: 'absolute', top: '20px', right: '20px', padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    formSection: { padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '30px', backgroundColor: '#f9f9f9' },
    formContainer: { display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 20px', maxWidth: '800px', margin: '0 auto', padding: '15px' },
    submitButton: { gridColumn: '1 / 3', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px' },
    updateButton: { gridColumn: '1 / 3', padding: '12px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px' },
    cancelButton: { gridColumn: '1 / 3', padding: '12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '5px' },
    studentList: { marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
    studentItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', border: '1px solid #e9ecef', borderRadius: '5px', backgroundColor: 'white' },
    photo: { width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover' },
    details: { flexGrow: 1 },
    actions: { display: 'flex', gap: '10px' },
    editButton: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' },
    deleteButton: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' },
};

export default AdminDashboard;
