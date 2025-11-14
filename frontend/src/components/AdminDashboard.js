// frontend/src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const BASE_URL = 'https://kmv-web-drama-web-2v.onrender.com'; 
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

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/students`); 
                setStudents(res.data);
            } catch (err) {
                console.error('Error fetching students:', err);
                alert('Error fetching student data. Please check the backend server status (Render.com).');
            } finally {
                setLoading(false); // Ensures loading screen is dismissed even on error
            }
        };
        fetchStudents();
        
        // Socket.io for Real-time updates
        socket.on('students_updated', (updatedStudents) => {
            setStudents(updatedStudents);
        });

        return () => {
            socket.off('students_updated');
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic Client-side Validation (10-digit contact number)
        if (!/^\d{10}$/.test(formData.contactNumber)) {
            alert('Please enter a valid 10-digit contact number.');
            return;
        }

        const dataToSend = { ...formData };

        try {
            if (isEditing) {
                await axios.put(`${BASE_URL}/api/students/${editingId}`, dataToSend); 
                alert('Student data updated successfully!');
            } else {
                await axios.post(`${BASE_URL}/api/students`, dataToSend); 
                alert('New student registered successfully!');
            }
            resetForm();
        } catch (err) {
            console.error('Submission Error:', err.response?.data || err.message);
            alert(`Error during submission: ${err.response?.data?.msg || 'Please check the Console.'}`);
        }
    };

    const resetForm = () => {
        setFormData(initialStudentState);
        setIsEditing(false);
        setEditingId(null);
    };

    const startEdit = (student) => {
        // Formats date string correctly for the 'date' input type
        const dobString = student.dateOfBirth ? student.dateOfBirth.substring(0, 10) : ''; 
        setFormData({ 
            ...student,
            dateOfBirth: dobString 
        });
        setEditingId(student._id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to PERMANENTLY delete this student record?')) {
            try {
                await axios.delete(`${BASE_URL}/api/students/${id}`); 
                alert('Student record successfully removed!');
                if (editingId === id) {
                    resetForm();
                }
            } catch (err) {
                console.error('Deletion Error:', err.response?.data || err.message);
                alert('Error deleting student.');
            }
        }
    };
    
    // 🔒 Login Check
    if (!localStorage.getItem('adminToken')) { 
        return (
             <div style={styles.accessDenied}>
                <h1>🔒 Admin Access Denied</h1>
                <p>Please log in as an administrator to view this page.</p>
             </div>
        );
    }

    // 🔄 Loading Screen
    if (loading) return (
        <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={{marginTop: '20px', color: '#007bff'}}>Loading Data...</p>
        </div>
    );

    // Apply input field styling logic to include hover/focus effects
    const inputStyle = {
        ...styles.inputField,
        // Define a way to apply focus style conditionally if not possible directly in the CSS-in-JS object
        // For simplicity in this static object, the focus style is handled in the styles definition (using ':focus')
    };

    return (
        <div style={styles.container}>
            <header style={{...styles.header, ...styles.headerShadow}}>
                <h1>🔑 Admin Registration Dashboard</h1>
                <button 
                    onClick={onLogout} 
                    style={styles.logoutButton}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.logoutButtonHover.backgroundColor}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.logoutButton.backgroundColor}
                >
                    🚪 Logout
                </button>
            </header>
            
            <div style={styles.formSection}>
                <h2 style={styles.formHeading}>{isEditing ? '✏️ Edit Student Details' : '➕ Register New Student'}</h2>
                <form onSubmit={handleSubmit} style={styles.formContainer}>
                    
                    {/* Input Fields */}
                    
                    {/* Full Name */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name:</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} style={inputStyle} required />
                    </div>
                    {/* DOB - Changed to type="date" */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Date of Birth:</label>
                        <input 
                            type="date" // Uses native date picker
                            name="dateOfBirth" 
                            value={formData.dateOfBirth} 
                            onChange={handleChange} 
                            style={inputStyle} 
                            required 
                        />
                    </div>
                    
                    {/* Grade */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Grade:</label>
                        <select name="grade" value={formData.grade} onChange={handleChange} style={inputStyle} required>
                            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    {/* Contact Number */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Contact Number:</label>
                        <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} style={inputStyle} required />
                    </div>
                    
                    {/* Parents' Names */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Father's Name:</label>
                        <input type="text" name="parentNameFather" value={formData.parentNameFather} onChange={handleChange} style={inputStyle} required />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Mother's Name:</label>
                        <input type="text" name="parentNameMother" value={formData.parentNameMother} onChange={handleChange} style={inputStyle} required />
                    </div>
                    
                    {/* Photo URL (Full Width) */}
                    <div style={styles.fullWidthGroup}>
                        <label style={styles.label}>Student Photo URL:</label> 
                        <div style={styles.urlInputContainer}> 
                            <input 
                                type="url" // Uses URL input type for better validation
                                name="studentPhoto" 
                                value={formData.studentPhoto} 
                                onChange={handleChange} 
                                style={{...inputStyle, flexGrow: 1}} 
                                placeholder="Paste Image URL here" 
                            />
                            <button 
                                type="button" 
                                onClick={() => window.open('https://catbox.moe/', '_blank')} 
                                style={styles.uploadHelperButton}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.uploadHelperButtonHover.backgroundColor}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.uploadHelperButton.backgroundColor}
                            >
                                ⬆️ Upload Helper
                            </button>
                        </div>
                        {formData.studentPhoto && (
                            <div style={styles.photoPreviewContainer}>
                                <img 
                                    src={formData.studentPhoto} 
                                    alt="Student Preview" 
                                    style={styles.photoPreview} 
                                    // Fallback for broken image URLs
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100?text=Invalid+URL'; }} 
                                />
                                <p style={styles.previewText}>Photo Preview</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Notes (Full Width) */}
                    <div style={styles.fullWidthGroup}>
                        <label style={styles.label}>Notes:</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} style={{...inputStyle, minHeight: '80px'}}></textarea>
                    </div>
                    
                    <div style={styles.buttonGroup}>
                        {isEditing && (
                            <button 
                                type="button" 
                                onClick={resetForm} 
                                style={styles.cancelButton}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.cancelButtonHover.backgroundColor}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.cancelButton.backgroundColor}
                            >
                                ❌ Cancel Edit
                            </button>
                        )}
                        <button 
                            type="submit" 
                            style={isEditing ? styles.updateButton : styles.submitButton}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = isEditing ? styles.updateButtonHover.backgroundColor : styles.submitButtonHover.backgroundColor}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = isEditing ? styles.updateButton.backgroundColor : styles.submitButton.backgroundColor}
                        >
                            {isEditing ? '💾 Update Details' : '✅ Register Student'}
                        </button>
                    </div>
                </form>
            </div>

            <hr style={{ margin: '40px 0', border: '1px solid #ddd' }} />

            <h2 style={styles.listHeading}>📋 Current Registered Students</h2> 
            <div style={styles.studentList}>
                {students.length === 0 ? (
                    <p style={styles.noData}>No student records found.</p>
                ) : (
                    students.map(student => (
                        <div key={student._id} 
                            style={styles.studentItem}
                            onMouseOver={(e) => e.currentTarget.style.boxShadow = styles.studentItemHover.boxShadow}
                            onMouseOut={(e) => e.currentTarget.style.boxShadow = styles.studentItem.boxShadow}
                        >
                            <img src={student.studentPhoto || 'https://via.placeholder.com/60?text=P'} alt={student.fullName} style={styles.photo} />
                            <div style={styles.details}>
                                <strong style={styles.studentName}>{student.fullName}</strong>
                                <span style={styles.studentGrade}> | {student.grade}</span>
                                <p style={styles.studentContact}>📞 {student.contactNumber}</p>
                                {student.notes && <p style={styles.studentNote}>📝 {student.notes}</p>}
                            </div>
                            <div style={styles.actions}>
                                <button 
                                    onClick={() => startEdit(student)} 
                                    style={styles.editButton}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.editButtonHover.backgroundColor}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.editButton.backgroundColor}
                                >
                                    ✏️ Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(student._id)} 
                                    style={styles.deleteButton}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.deleteButtonHover.backgroundColor}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.deleteButton.backgroundColor}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// ----------------------------------------------------
// ✨ Modern and Elegant Styles (CSS-in-JS) ✨
// ----------------------------------------------------
const styles = {
    // General Container & Header Styles
    container: { 
        padding: '30px', 
        backgroundColor: '#f4f7f9', // Light background
        borderRadius: '12px',
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0 20px 0',
        borderBottom: '2px solid #e0e6ed',
        marginBottom: '30px',
    },
    headerShadow: { // Added shadow to header for visual depth
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
        backgroundColor: 'white', // Ensure header background is white for shadow contrast
        padding: '20px 30px',
        borderRadius: '10px 10px 0 0',
        margin: '-30px -30px 30px -30px', // Extend header to edges of main container padding
    },
    logoutButton: { 
        padding: '10px 18px', 
        backgroundColor: '#dc3545', // Red
        color: 'white', 
        border: 'none', 
        borderRadius: '25px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.15)',
        transition: 'background-color 0.3s',
    },
    logoutButtonHover: {
        backgroundColor: '#c82333', // Darker Red
    },
    accessDenied: {
        textAlign: 'center',
        padding: '50px',
        backgroundColor: '#ffe6e6',
        color: '#cc0000',
        borderRadius: '8px',
        border: '1px solid #ffb3b3',
        margin: '50px auto',
        maxWidth: '500px',
    },
    loadingContainer: {
        textAlign: 'center',
        padding: '50px',
        margin: '50px auto',
        maxWidth: '500px',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
    },
    spinner: {
        border: '4px solid rgba(0, 0, 0, 0.1)',
        borderTop: '4px solid #007bff',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        margin: '0 auto',
    },
    
    // Form Section Styles
    formSection: { 
        padding: '40px', 
        borderRadius: '15px', 
        marginBottom: '40px', 
        backgroundColor: 'white',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)', 
    },
    formHeading: {
        marginBottom: '30px',
        textAlign: 'center', 
        color: '#007bff',
        fontSize: '1.8em',
        fontWeight: '700',
    },
    formContainer: { 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '25px 40px', 
        maxWidth: '1000px',
        margin: '0 auto', 
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    fullWidthGroup: {
        gridColumn: '1 / 3', 
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '8px',
        fontWeight: '600',
        color: '#495057',
        fontSize: '0.95em',
    },
    inputField: { 
        padding: '12px', 
        border: '1px solid #ced4da', 
        borderRadius: '8px', 
        fontSize: '1em',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        // Note: Focus/Hover styles are difficult in static JS objects, but this baseline is good.
    },
    urlInputContainer: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
    uploadHelperButton: {
        padding: '10px 15px',
        backgroundColor: '#ffc107', 
        color: '#333', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.3s, transform 0.1s',
        whiteSpace: 'nowrap', 
        height: '42px', 
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    },
    uploadHelperButtonHover: {
        backgroundColor: '#e0a800', // Darker Yellow
    },
    photoPreviewContainer: {
        marginTop: '15px',
        textAlign: 'center',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px dashed #ced4da',
    },
    photoPreview: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '4px solid #007bff',
        marginBottom: '5px',
    },
    previewText: {
        fontSize: '0.8em',
        color: '#6c757d',
    },
    buttonGroup: {
        gridColumn: '1 / 3', 
        display: 'flex',
        justifyContent: 'flex-end', 
        gap: '20px',
        marginTop: '25px',
        paddingTop: '20px',
        borderTop: '1px solid #e9ecef',
    },
    submitButton: { 
        backgroundColor: '#28a745', // Green
        color: 'white', 
        padding: '12px 30px', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        fontSize: '1em',
        transition: 'background-color 0.3s, transform 0.1s',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    submitButtonHover: {
        backgroundColor: '#1e7e34', // Darker Green
    },
    updateButton: { 
        backgroundColor: '#007bff', // Blue
        color: 'white', 
        padding: '12px 30px', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        fontSize: '1em',
        transition: 'background-color 0.3s, transform 0.1s',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    updateButtonHover: {
        backgroundColor: '#0056b3', // Darker Blue
    },
    cancelButton: { 
        backgroundColor: '#6c757d', // Grey
        color: 'white', 
        padding: '12px 30px', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        fontSize: '1em',
        transition: 'background-color 0.3s, transform 0.1s',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    cancelButtonHover: {
        backgroundColor: '#5a6268', // Darker Grey
    },

    // Student List Styles
    listHeading: {
        maxWidth: '1000px', 
        margin: '40px auto 20px auto', 
        color: '#343a40',
        borderLeft: '5px solid #007bff',
        paddingLeft: '15px',
    },
    studentList: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px',
        maxWidth: '1000px',
        margin: '0 auto', 
    },
    studentItem: { 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '15px 25px', 
        borderRadius: '10px', 
        backgroundColor: '#ffffff', 
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)', 
        transition: 'box-shadow 0.3s', // Added transition
    },
    studentItemHover: {
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)', // Stronger shadow on hover
    },
    noData: {
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#fffbe6',
        border: '1px solid #ffeeba',
        borderRadius: '8px',
        color: '#856404',
        margin: '20px 0',
    },
    photo: { 
        width: '55px', 
        height: '55px', 
        borderRadius: '50%', 
        marginRight: '20px', 
        objectFit: 'cover',
        border: '3px solid #007bff', 
        flexShrink: 0,
    },
    details: { 
        flexGrow: 1,
        marginLeft: '15px', 
    },
    studentName: {
        fontSize: '1.1em',
        fontWeight: '700',
        color: '#343a40',
    },
    studentGrade: {
        fontSize: '1em',
        color: '#007bff',
        fontWeight: '600',
    },
    studentContact: {
        margin: '3px 0',
        fontSize: '0.9em',
        color: '#555',
    },
    studentNote: {
        margin: '3px 0',
        fontSize: '0.85em',
        color: '#6c757d',
        fontStyle: 'italic',
        maxWidth: '400px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    actions: { 
        display: 'flex', 
        gap: '12px',
        flexShrink: 0,
    },
    editButton: { 
        backgroundColor: '#ffc107', // Amber/Yellow
        color: 'black',
        border: 'none', 
        padding: '8px 12px', 
        borderRadius: '25px', 
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.3s, transform 0.1s',
    },
    editButtonHover: {
        backgroundColor: '#e0a800', // Darker Yellow
    },
    deleteButton: { 
        backgroundColor: '#dc3545', // Red
        color: 'white', 
        border: 'none', 
        padding: '8px 12px', 
        borderRadius: '25px', 
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.3s, transform 0.1s',
    },
    deleteButtonHover: {
        backgroundColor: '#c82333', // Darker Red
    }
};

export default AdminDashboard;
