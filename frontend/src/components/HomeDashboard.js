// frontend/src/components/HomeDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const BASE_URL = 'https://kmv-web-drama-web-2v.onrender.com'; 
const socket = io(BASE_URL); 

// 🎨 නවීන වර්ණ පද්ධතිය
const GRADE_COLORS = {
    '6 ශ්‍රේණිය': '#A8E6CF', // Light Green
    '7 ශ්‍රේණිය': '#FFC3A0', // Light Coral
    '8 ශ්‍රේණිය': '#FF6768', // Strong Coral
    '9 ශ්‍රේණිය': '#6AB4FF', // Light Blue
    '10 ශ්‍රේණිය': '#FFD700', // Gold
    '11 ශ්‍රේණිය': '#B28CFF', // Lavender
};
const GRADES = Object.keys(GRADE_COLORS);

// Helper function to group students by grade
const groupStudentsByGrade = (students) => {
    return students.reduce((acc, student) => {
        const grade = student.grade || 'Unknown';
        if (!acc[grade]) {
            acc[grade] = [];
        }
        acc[grade].push(student);
        return acc;
    }, {});
};

const HomeDashboard = ({ onLogout }) => {
    const [allStudents, setAllStudents] = useState([]);
    const [groupedStudents, setGroupedStudents] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedGrade, setExpandedGrade] = useState(null); 

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/students`);
                const students = res.data;
                setAllStudents(students);
                setGroupedStudents(groupStudentsByGrade(students));
                setLoading(false);
            } catch (err) {
                console.error('Error fetching students:', err);
                setLoading(false);
            }
        };

        fetchStudents();

        socket.on('students_updated', (updatedStudents) => {
            setAllStudents(updatedStudents);
            setGroupedStudents(groupStudentsByGrade(updatedStudents));
        });

        return () => {
            socket.off('students_updated');
        };
    }, []);

    const handleGradeClick = (grade) => {
        setExpandedGrade(expandedGrade === grade ? null : grade);
    };

    if (loading) return <div>Loading Dashboard...</div>;

    const totalStudents = allStudents.length;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>📚 ශිෂ්‍ය තොරතුරු ක්ෂණික වාර්තාව</h1>
                <div style={styles.searchBar}>
                   <input 
                       type="text" 
                       placeholder="Search by Student Name..." 
                       style={styles.searchInput}
                   />
                </div>
            </div>

            <div style={styles.gradeGrid}>
                {GRADES.map(grade => {
                    const studentsInGrade = groupedStudents[grade] || [];
                    const count = studentsInGrade.length;
                    const color = GRADE_COLORS[grade];
                    const isExpanded = expandedGrade === grade;

                    return (
                        <div key={grade} style={styles.gradeWrapper}>
                            <div 
                                style={{...styles.gradeCard, backgroundColor: color}} 
                                onClick={() => handleGradeClick(grade)}
                            >
                                <h3 style={styles.gradeName}>{grade}</h3>
                                <p style={styles.studentCount}>
                                    ශිෂ්‍ය සංඛ්‍යාව: 
                                    <span style={styles.countNumber}>{count}</span>
                                </p>
                                <span style={styles.expandIcon}>
                                    {isExpanded ? '▲' : '▼'}
                                </span>
                            </div>

                            {/* Students List - Click කළ විට පමණක් පෙන්වයි */}
                            {isExpanded && (
                                <div style={styles.studentList}>
                                    {count > 0 ? (
                                        studentsInGrade.map(student => (
                                            <div key={student._id} style={styles.studentItem}>
                                                
                                                <div style={styles.studentDetails}>
                                                    
                                                    {/* 🛑 නම */}
                                                    <strong style={styles.studentNameHeader}>{student.fullName}</strong>
                                                    
                                                    {/* 🛑 උපන් දිනය */}
                                                    <p style={styles.detailText}>🎂 උපන් දිනය: <span style={styles.highlightText}>{student.dateOfBirth}</span></p>
                                                    
                                                    {/* 🛑 දෙමාපියන්ගේ නම් */}
                                                    <p style={styles.detailText}>🧔 පියා: <span style={styles.highlightText}>{student.parentNameFather}</span></p>
                                                    <p style={styles.detailText}>👩 මව: <span style={styles.highlightText}>{student.parentNameMother}</span></p>
                                                    
                                                    {/* 📞 දුරකථන අංකය */}
                                                    <p style={styles.detailText}>📞 දුරකථන අංකය: {student.contactNumber}</p>
                                                </div>
                                                
                                                {/* 🛑 WhatsApp බොත්තම */}
                                                {student.contactNumber && (
                                                    <a 
                                                        href={`https://wa.me/94${student.contactNumber.replace(/^0/, '')}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        style={styles.whatsappLink}
                                                    >
                                                        <span style={styles.whatsappButton}>
                                                            💬 WhatsApp Message
                                                        </span>
                                                    </a>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p style={styles.noStudents}>ශිෂ්‍යයින් ලියාපදිංචි වී නොමැත.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={styles.totalCount}>
                <h2>මුළු ශිෂ්‍ය සංඛ්‍යාව: {totalStudents}</h2>
            </div>
            
        </div>
    );
};

// ✨ නවීන සහ අලංකාර විලාසිතා (Styles) ✨
const styles = {
    container: {
        padding: '40px 20px',
        backgroundColor: '#f0f2f5', 
        minHeight: '100vh',
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
        color: '#333',
    },
    searchBar: {
        maxWidth: '600px',
        margin: '20px auto',
    },
    searchInput: {
        width: '100%',
        padding: '12px 20px',
        borderRadius: '25px',
        border: '2px solid #ddd',
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
        fontSize: '1em',
    },
    gradeGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    gradeWrapper: {
        marginBottom: '10px',
        borderRadius: '15px',
        overflow: 'hidden', 
        border: '1px solid #ddd', // පැහැදිලි සීමාවක් සඳහා
    },
    gradeCard: {
        padding: '20px 25px',
        borderRadius: '15px', 
        color: '#333',
        textAlign: 'left',
        cursor: 'pointer', 
        transition: 'all 0.3s ease',
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)', 
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    gradeName: {
        fontSize: '1.5em',
        fontWeight: '700',
        margin: 0,
        flexGrow: 1,
    },
    studentCount: {
        fontSize: '1.1em',
        color: '#555',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
    },
    countNumber: {
        fontSize: '1.2em',
        fontWeight: '900',
        marginLeft: '10px',
        padding: '5px 10px',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '10px',
    },
    expandIcon: {
        fontSize: '1.2em',
        marginLeft: '15px',
        transition: 'transform 0.3s ease',
    },
    
    // Student List Styles (දිග හැරෙන කොටස)
    studentList: {
        backgroundColor: '#fcfcfc',
        padding: '15px 0',
        borderTop: '2px solid #e0e0e0',
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
    },
    studentItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px 20px',
        borderBottom: '1px solid #f0f0f0',
        justifyContent: 'space-between', 
    },
    studentDetails: {
        textAlign: 'left',
        flexGrow: 1, 
    },
    studentNameHeader: {
        color: '#007BFF',
        fontSize: '1.2em',
        fontWeight: 'bold',
        marginBottom: '5px',
        display: 'block',
    },
    detailText: {
        margin: '2px 0',
        fontSize: '0.9em',
        color: '#444',
    },
    highlightText: {
        fontWeight: '600',
        color: '#333',
    },
    noStudents: {
        textAlign: 'center',
        color: '#999',
        padding: '10px 0',
    },
    
    // WhatsApp Button Style
    whatsappLink: {
        textDecoration: 'none',
        flexShrink: 0, 
        marginLeft: '15px',
    },
    whatsappButton: {
        padding: '8px 15px',
        backgroundColor: '#25D366', 
        color: 'white',
        borderRadius: '25px',
        fontSize: '0.85em',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 10px rgba(37, 211, 102, 0.4)',
        cursor: 'pointer',
    },

    totalCount: {
        textAlign: 'center',
        marginTop: '50px',
        padding: '20px',
        backgroundColor: '#fff',
        maxWidth: '400px',
        margin: '50px auto 0 auto',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
    },
};

export default HomeDashboard;
