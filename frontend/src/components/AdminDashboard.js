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

// 🛑 AdminDashboard එකට navigationProps (setCurrentPage) අවශ්‍ය නැත. 
// onLogout පමණක් අවශ්‍ය වේ.
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
                setLoading(false);
            } catch (err) {
                console.error('Error fetching students:', err);
            }
        };
        fetchStudents();
        
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
        const dataToSend = { ...formData };

        try {
            if (isEditing) {
                await axios.put(`${BASE_URL}/api/students/${editingId}`, dataToSend); 
                alert('Student data updated successfully! (Real-time update triggered)');
            } else {
                await axios.post(`${BASE_URL}/api/students`, dataToSend); 
                alert('Student registered successfully! (Real-time update triggered)');
            }
            resetForm();
        } catch (err) {
            console.error('Submission Error:', err.response?.data || err.message);
            alert(`Error during submission: ${err.response?.data?.msg || 'Check console.'}`);
        }
    };

    const resetForm = () => {
        setFormData(initialStudentState);
        setIsEditing(false);
        setEditingId(null);
    };

    const startEdit = (student) => {
        const dobString = student.dateOfBirth || ''; // Date format should match YYYY-MM-DD
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
    
    // 🛑 Note: App.js මගින් Admin Logged In Logic පාලනය කරයි, නමුත් මෙය ආරක්ෂාව සඳහා හොඳයි
    if (!localStorage.getItem('adminToken')) {
        return (
             <div style={styles.accessDenied}>
                <h1>🔒 Access Denied</h1>
                <p>Please log in as an administrator to view this page.</p>
             </div>
        );
    }

    if (loading) return <div>Loading Admin Panel...</div>;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1>🔑 Admin Registration Dashboard</h1>
                {/* Logout බොත්තම Header එක තුළට */}
                <button onClick={onLogout} style={styles.logoutButton}>
                    🚪 Logout
                </button>
            </header>
            
            <div style={styles.formSection}>
                <h2 style={styles.formHeading}>{isEditing ? '✏️ ශිෂ්‍ය තොරතුරු සංස්කරණය' : '➕ නව ශිෂ්‍ය ලියාපදිංචිය'}</h2>
                <form onSubmit={handleSubmit} style={styles.formContainer}>
                    
                    {/* Input Fields - Grid Layout */}
                    
                    {/* Row 1: Full Name & DOB */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>සම්පූර්ණ නම (Full Name):</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} style={styles.inputField} required />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>උපන් දිනය (DOB):</label>
                        <input 
                            type="text" 
                            name="dateOfBirth" 
                            value={formData.dateOfBirth} 
                            onChange={handleChange} 
                            style={styles.inputField} 
                            placeholder="YYYY-MM-DD (උදා: 2005-08-15)"
                            required 
                        />
                    </div>
                    
                    {/* Row 2: Grade & Contact */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>ශ්‍රේණිය (Grade):</label>
                        <select name="grade" value={formData.grade} onChange={handleChange} style={styles.inputField} required>
                            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>දුරකථන අංකය (Contact Number):</label>
                        <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} style={styles.inputField} required />
                    </div>
                    
                    {/* Row 3: Parents' Names */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>පියාගේ නම (Father's Name):</label>
                        <input type="text" name="parentNameFather" value={formData.parentNameFather} onChange={handleChange} style={styles.inputField} required />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>මවගේ නම (Mother's Name):</label>
                        <input type="text" name="parentNameMother" value={formData.parentNameMother} onChange={handleChange} style={styles.inputField} required />
                    </div>
                    
                    {/* Row 4: Photo URL (Full Width) */}
                    <div style={styles.fullWidthGroup}>
                        <label style={styles.label}>ශිෂ්‍ය ඡායාරූප URL (Student Photo URL):</label> 
                        <div style={styles.urlInputContainer}> 
                            <input 
                                type="text" 
                                name="studentPhoto" 
                                value={formData.studentPhoto} 
                                onChange={handleChange} 
                                style={{...styles.inputField, flexGrow: 1}} 
                                placeholder="Paste Image URL here (e.g., from Catbox.moe)" 
                            />
                            <button 
                                type="button" 
                                onClick={() => window.open('https://catbox.moe/', '_blank')} 
                                style={styles.uploadHelperButton}>
                                ⬆️ Upload Helper
                            </button>
                        </div>
                        {formData.studentPhoto && (
                            <div style={styles.photoPreviewContainer}>
                                <img src={formData.studentPhoto} alt="Student Preview" style={styles.photoPreview} />
                                <p style={styles.previewText}>ඡායාරූප පෙරදසුන</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Row 5: Notes (Full Width) */}
                    <div style={styles.fullWidthGroup}>
                        <label style={styles.label}>අමතර සටහන් (Notes):</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} style={{...styles.inputField, minHeight: '80px'}}></textarea>
                    </div>
                    
                    <div style={styles.buttonGroup}>
                        {isEditing && (
                            <button type="button" onClick={resetForm} style={styles.cancelButton}>
                                ❌ සංස්කරණය අවලංගු කරන්න
                            </button>
                        )}
                        <button type="submit" style={isEditing ? styles.updateButton : styles.submitButton}>
                            {isEditing ? '💾 විස්තර යාවත්කාලීන කරන්න' : '✅ ශිෂ්‍යයා ලියාපදිංචි කරන්න'}
                        </button>
                    </div>
                </form>
            </div>

            <hr style={{ margin: '40px 0', border: '1px solid #ddd' }} />

            <h2 style={styles.listHeading}>📋 ලියාපදිංචි ශිෂ්‍ය වාර්තා</h2> 
            <div style={styles.studentList}>
                {students.map(student => (
                    <div key={student._id} style={styles.studentItem}>
                        <img src={student.studentPhoto || 'https://via.placeholder.com/60?text=P'} alt={student.fullName} style={styles.photo} />
                        <div style={styles.details}>
                            <strong style={styles.studentName}>{student.fullName}</strong>
                            <span style={styles.studentGrade}> | {student.grade}</span>
                            <p style={styles.studentContact}>📞 {student.contactNumber}</p>
                            {student.notes && <p style={styles.studentNote}>📝 {student.notes}</p>}
                        </div>
                        <div style={styles.actions}>
                            <button onClick={() => startEdit(student)} style={styles.editButton}>✏️ Edit</button>
                            <button onClick={() => handleDelete(student._id)} style={styles.deleteButton}>🗑️ Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ✨ නවීන සහ අලංකාර විලාසිතා (Styles) ✨
const styles = {
    // ----------------------------------------------------
    // General Container & Header Styles
    // ----------------------------------------------------
    container: { 
        padding: '30px', 
        backgroundColor: '#f8f9fa', // Light background for contrast
        borderRadius: '12px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '20px',
        borderBottom: '2px solid #e9ecef',
        marginBottom: '30px',
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
    accessDenied: {
        textAlign: 'center',
        padding: '50px',
        backgroundColor: '#fff3cd',
        color: '#856404',
        borderRadius: '8px',
        border: '1px solid #ffeeba',
    },

    // ----------------------------------------------------
    // Form Section Styles
    // ----------------------------------------------------
    formSection: { 
        padding: '40px', 
        border: 'none', 
        borderRadius: '15px', 
        marginBottom: '40px', 
        backgroundColor: 'white',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)', // Stronger, modern shadow
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
        // නව layout: 2 Columns
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
        gridColumn: '1 / 3', // Spans both columns
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '5px',
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
    },
    urlInputContainer: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
    uploadHelperButton: {
        padding: '10px 15px',
        backgroundColor: '#ffc107', // Orange/Yellow
        color: '#333', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap', 
        height: '42px', 
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
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
    baseButton: {
        padding: '12px 30px', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        fontSize: '1em',
        transition: 'background-color 0.3s, transform 0.1s',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    submitButton: { 
        ...this.baseButton,
        backgroundColor: '#28a745', // Green
        color: 'white', 
    },
    updateButton: { 
        ...this.baseButton,
        backgroundColor: '#007bff', // Blue
        color: 'white', 
    },
    cancelButton: { 
        ...this.baseButton,
        backgroundColor: '#6c757d', // Grey
        color: 'white', 
    },

    // ----------------------------------------------------
    // Student List Styles
    // ----------------------------------------------------
    listHeading: {
        maxWidth: '1000px', 
        margin: '40px auto 20px auto', 
        padding: '0 20px', 
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
        padding: '0 20px', 
    },
    studentItem: { 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '15px 25px', 
        border: '1px solid #f0f0f0', 
        borderRadius: '10px', 
        backgroundColor: '#ffffff', 
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)', // Clearer separation
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
    actionButtonBase: {
        border: 'none', 
        padding: '8px 12px', 
        borderRadius: '25px', 
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'transform 0.1s',
    },
    editButton: { 
        ...this.actionButtonBase,
        backgroundColor: '#ffc107', // Amber/Yellow
        color: 'black',
    },
    deleteButton: { 
        ...this.actionButtonBase,
        backgroundColor: '#dc3545', // Red
        color: 'white', 
    },
};

export default AdminDashboard;
