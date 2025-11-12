// frontend/src/components/HomeDashboard.js
import React, { useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import StudentCard from './StudentCard'; // StudentCard Component එක අවශ්‍යයි

// Connect to the Socket.io server
const socket = io('http://localhost:5000'); 

const GRADES = ['6 ශ්‍රේණිය', '7 ශ්‍රේණිය', '8 ශ්‍රේණිය', '9 ශ්‍රේණිය', '10 ශ්‍රේණිය', '11 ශ්‍රේණිය'];

const HomeDashboard = () => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Initial data fetch and Real-time listener
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/students');
                setStudents(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching students:', err);
            }
        };
        fetchStudents();

        // Listen for real-time updates from the backend
        socket.on('students_updated', (updatedStudents) => {
            setStudents(updatedStudents);
        });

        // Cleanup function
        return () => {
            socket.off('students_updated');
        };
    }, []);

    // Filtering logic (Search Bar)
    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        return students.filter(student =>
            student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [students, searchTerm]);

    // Grouping students by Grade
    const studentsByGrade = filteredStudents.reduce((acc, student) => {
        if (!acc[student.grade]) {
            acc[student.grade] = [];
        }
        acc[student.grade].push(student);
        return acc;
    }, {});

    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Loading Student Data...</div>;

    return (
        <div style={styles.container}>
            <h1>🏫 Student Registration Home Dashboard</h1>
            
            {/* Search Bar */}
            <input
                type="text"
                placeholder="🔎 Search by Student Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchBar}
            />

            {/* Display Students by Grade */}
            {GRADES.map(grade => (
                <div key={grade} style={styles.gradeSection}>
                    <h2>{grade} - Registered ({studentsByGrade[grade]?.length || 0})</h2>
                    <div style={styles.studentGrid}>
                        {studentsByGrade[grade]?.length > 0 ? (
                            studentsByGrade[grade].map(student => (
                                <StudentCard key={student._id} student={student} />
                            ))
                        ) : (
                            <p>No students registered for this grade yet.</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const styles = {
    container: { padding: '20px' },
    searchBar: { padding: '12px', width: '100%', maxWidth: '600px', margin: '20px 0', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' },
    gradeSection: { marginBottom: '30px', padding: '15px', borderLeft: '5px solid #ffc107', backgroundColor: '#fffbe6' },
    studentGrid: { display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '15px' },
};

export default HomeDashboard;
