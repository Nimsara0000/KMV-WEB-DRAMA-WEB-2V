// frontend/src/components/StudentCard.js
import React from 'react';

const StudentCard = ({ student }) => {
    // Format date of birth to a readable format
    const formattedDate = new Date(student.dateOfBirth).toLocaleDateString('si-LK', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Default image if photo URL is missing or broken
    const defaultPhoto = 'https://via.placeholder.com/150?text=Student+Photo'; 
    const photoUrl = student.studentPhoto || defaultPhoto;

    return (
        <div style={styles.card}>
            <img src={photoUrl} alt={student.fullName} style={styles.photo} onError={(e)=>{e.target.onerror = null; e.target.src=defaultPhoto}}/>
            <div style={styles.details}>
                <h3 style={styles.name}>{student.fullName}</h3>
                <p><strong>Grade:</strong> {student.grade}</p>
                <p><strong>DOB:</strong> {formattedDate}</p>
                <p><strong>Contact:</strong> {student.contactNumber}</p>
                {student.notes && <p style={styles.notes}>* {student.notes}</p>}
            </div>
        </div>
    );
};

const styles = {
    card: {
        width: '300px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        padding: '15px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#fff',
        transition: 'transform 0.2s',
    },
    photo: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        objectFit: 'cover',
        marginRight: '15px',
        border: '3px solid #0056b3',
    },
    details: {
        flexGrow: 1,
    },
    name: {
        margin: '0 0 5px 0',
        color: '#0056b3',
    },
    notes: {
        fontSize: '0.9em',
        color: '#888',
        marginTop: '10px',
        borderTop: '1px dashed #ccc',
        paddingTop: '5px'
    }
};

export default StudentCard;
