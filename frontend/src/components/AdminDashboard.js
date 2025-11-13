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
    studentPhoto: '', // 🛑 මෙය නැවත URL එකක් ලෙස සලකනු ලැබේ
    notes: ''
};

const AdminDashboard = ({ onLogout }) => {
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState(initialStudentState);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    // 🛑 Direct File Upload සඳහා තිබූ selectedFile state එක ඉවත් කර ඇත.

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
        
        // 🛑 දැන් අපි නැවත සාමාන්‍ය JSON දත්ත යවමු
        const dataToSend = { ...formData };

        try {
            if (isEditing) {
                // UPDATE operation (PUT)
                // 🛑 multipart/form-data Headers ඉවත් කර ඇත
                await axios.put(`${BASE_URL}/api/students/${editingId}`, dataToSend); 
                alert('Student data updated successfully! (Real-time update triggered)');
            } else {
                // CREATE operation (POST)
                // 🛑 multipart/form-data Headers ඉවත් කර ඇත
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
        // 🛑 selectedFile reset කිරීමේ අවශ්‍යතාවක් නැත
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
                    
                    {/* Input Fields (text, date, select) */}
                    <label>Full Name:</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} style={styles.inputField} required />
                    
                    <label>Date of Birth:</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} style={styles.inputField} required />
                    
                    <label>Grade:</label>
                    <select name="grade" value={formData.grade} onChange={handleChange} style={styles.inputField} required>
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>

                    <label>Father's Name:</label>
                    <input type="text" name="parentNameFather" value={formData.parentNameFather} onChange={handleChange} style={styles.inputField} required />
                    <label>Mother's Name:</label>
                    <input type="text" name="parentNameMother" value={formData.parentNameMother} onChange={handleChange} style={styles.inputField} required />
                    
                    <label>Contact Number:</label>
                    <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} style={styles.inputField} required />
                    
                    {/* 🛑 Student Photo URL Input with Helper Button */}
                    <label>Student Photo URL:</label> 
                    <div style={styles.urlInputContainer}> 
                        <input 
                            type="text" // 🛑 මෙය type="text" යි
                            name="studentPhoto" 
                            value={formData.studentPhoto} 
                            onChange={handleChange} 
                            style={{...styles.inputField, flexGrow: 1}} // Input එකට වැඩි ඉඩක්
                            placeholder="Paste Image URL here (e.g., from Imgur, Postimages)"
                        />
                        <button 
                            type="button" 
                            onClick={() => window.open('https://imgur.com/upload', '_blank')} 
                            style={styles.uploadHelperButton}>
                            ⬆️ Upload Helper
                        </button>
                    </div>
                    {/* 🛑 ගොනු Input එකට අදාළ කොන්දේසි සහිත p tag එක ඉවත් කර ඇත */}
                    
                    <label>Notes:</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} style={styles.inputField}></textarea>
                    
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

            {/* --- Student List for Editing/Deleting --- */}
            <h2>📋 Current Registered Students</h2>
            <div style={styles.studentList}>
                {students.map(student => (
                    <div key={student._id} style={styles.studentItem}>
                        <img src={student.studentPhoto || 'https://via.placeholder.com/60?text=P'} alt={student.fullName} style={styles.photo} />
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

// ✨ යාවත්කාලීන කළ විලාසිතා (Styles) ✨
const styles = {
    container: { 
        padding: '30px', 
        position: 'relative',
        backgroundColor: 'white', 
        borderRadius: '12px',
    },
    logoutButton: { 
        position: 'absolute', 
        top: '30px', 
        right: '30px', 
        padding: '10px 18px', 
        backgroundColor: '#FF6347', // Tomato Red
        color: 'white', 
        border: 'none', 
        borderRadius: '25px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    },
    formSection: { 
        padding: '30px', 
        border: '1px solid #e0e0e0', 
        borderRadius: '10px', 
        marginBottom: '40px', 
        backgroundColor: '#f9f9ff', // Very light blue/purple tint
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
    },
    formContainer: { 
        display: 'grid', 
        gridTemplateColumns: '150px 1fr', 
        gap: '15px 30px', 
        maxWidth: '800px', 
        margin: '20px auto', 
        padding: '15px' 
    },
    // Input/Select/Textarea සඳහා පොදු විලාසිතාව
    inputField: { 
        padding: '10px', 
        border: '1px solid #ccc', 
        borderRadius: '6px', 
        fontSize: '1em',
        boxSizing: 'border-box',
    },
    
    // 🛑 නව Styles: URL Input එක සහ බොත්තම එකට තැබීමට
    urlInputContainer: {
        gridColumn: '2 / 3',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
    uploadHelperButton: {
        padding: '10px 15px',
        backgroundColor: '#FFA500', // Orange
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease',
        whiteSpace: 'nowrap', // බොත්තමේ වචන කැඩී යාම වලකයි
        height: '40px', // Input එකේ උසට සකස් කිරීමට
    },
    
    // බොත්තම් සඳහා මූලික විලාසිතාව
    baseButton: {
        gridColumn: '1 / 3', 
        padding: '12px', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        marginTop: '15px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    },
    submitButton: { 
        backgroundColor: '#28a745', // Green 
        color: 'white', 
        gridColumn: '1 / 3', 
        padding: '12px', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        marginTop: '15px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    },
    updateButton: { 
        backgroundColor: '#1E90FF', // Blue for Update
        color: 'white', 
        gridColumn: '1 / 3', 
        padding: '12px', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        marginTop: '15px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    },
    cancelButton: { 
        backgroundColor: '#6c757d', 
        color: 'white', 
        marginTop: '5px',
        gridColumn: '1 / 3', 
        padding: '12px', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    },
    studentList: { 
        marginTop: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px' 
    },
    studentItem: { 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '15px', 
        border: '1px solid #eee', 
        borderRadius: '8px', 
        backgroundColor: '#f9f9f9',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    },
    photo: { 
        width: '60px', 
        height: '60px', 
        borderRadius: '50%', 
        marginRight: '20px', 
        objectFit: 'cover',
        border: '3px solid #1E90FF', 
    },
    details: { 
        flexGrow: 1 
    },
    actions: { 
        display: 'flex', 
        gap: '10px' 
    },
    // Edit/Delete list buttons
    listButtonBase: {
        border: 'none', 
        padding: '8px 12px', 
        borderRadius: '25px', // Rounded buttons
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    },
    editButton: { 
        backgroundColor: '#ffc107', 
        color: 'black',
        border: 'none', 
        padding: '8px 12px', 
        borderRadius: '25px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    },
    deleteButton: { 
        backgroundColor: '#dc3545', 
        color: 'white', 
        border: 'none', 
        padding: '8px 12px', 
        borderRadius: '25px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    },
};

export default AdminDashboard;
