// frontend/src/components/HomeDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const BASE_URL = 'https://kmv-web-drama-web-2v.onrender.com'; 
const socket = io(BASE_URL); 

// Grade Colors for Aesthetic Appeal
const GRADE_COLORS = {
    '6 ශ්‍රේණිය': '#A8E6CF', // Light Green
    '7 ශ්‍රේණිය': '#FFC3A0', // Light Coral
    '8 ශ්‍රේණිය': '#FF6768', // Strong Coral
    '9 ශ්‍රේණිය': '#6AB4FF', // Light Blue
    '10 ශ්‍රේණිය': '#FFD700', // Gold
    '11 ශ්‍රේණිය': '#B28CFF', // Lavender
};

const GRADES = Object.keys(GRADE_COLORS);

const HomeDashboard = ({ onLogout }) => {
    const [gradeCounts, setGradeCounts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/students/counts`);
                setGradeCounts(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching counts:', err);
                setLoading(false);
            }
        };

        fetchCounts();

        // Listen for real-time updates
        socket.on('counts_updated', (updatedCounts) => {
            setGradeCounts(updatedCounts);
        });

        return () => {
            socket.off('counts_updated');
        };
    }, []);

    // Authorization Check - Home Dashboard එකට Login අවශ්‍ය නොවේ නම් මෙය ඉවත් කරන්න
    // if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
    //     return <p>🔒 Access Denied. Please log in as admin.</p>;
    // }

    if (loading) return <div>Loading Dashboard...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>📚 ශිෂ්‍ය තොරතුරු ක්ෂණික වාර්තාව</h1>
                {/* 🛑 Home Dashboard එකට Login අවශ්‍ය නම් පමණක් පහත බොත්තම තබන්න */}
                {/* <button onClick={onLogout} style={styles.logoutButton}>Logout</button> */}
            </div>

            <div style={styles.gradeGrid}>
                {GRADES.map(grade => {
                    const count = gradeCounts[grade] || 0;
                    const color = GRADE_COLORS[grade];

                    return (
                        <div key={grade} style={{...styles.gradeCard, backgroundColor: color}}>
                            <h3 style={styles.gradeName}>{grade}</h3>
                            <p style={styles.studentCount}>ශිෂ්‍ය සංඛ්‍යාව:</p>
                            <div style={styles.countCircle}>
                                <span>{count}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={styles.totalCount}>
                <h2>මුළු ශිෂ්‍ය සංඛ්‍යාව: {Object.values(gradeCounts).reduce((sum, count) => sum + count, 0)}</h2>
            </div>
            
        </div>
    );
};

// ✨ නවීන සහ අලංකාර විලාසිතා (Styles) ✨
const styles = {
    container: {
        padding: '40px 20px',
        backgroundColor: '#f0f2f5', // Light background
        minHeight: '100vh',
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
        color: '#333',
    },
    gradeGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', // Responsive Grid
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    // 🛑 Grade Card Styles - අලංකාර කිරීම
    gradeCard: {
        padding: '25px',
        borderRadius: '15px', // Rounded corners
        color: '#333',
        textAlign: 'center',
        cursor: 'default',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)', // Default shadow
        position: 'relative',
        overflow: 'hidden',
        // Hover Effect සඳහා CSS නොවන JavaScript Style
        // මෙය React Style එකක් බැවින්, සැබෑ Hover effect එකක් සඳහා
        // Card එකට වෙනම component එකක් අවශ්‍ය වේ, නමුත් අපි සරලව තබමු.
        // සටහන: සැබෑ hover effect මෙහිදී ක්‍රියාත්මක වන්නේ නැත, නමුත් අපි පෙනුම වැඩි දියුණු කර ඇත.
    },
    gradeName: {
        fontSize: '1.8em',
        fontWeight: '700',
        marginBottom: '10px',
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
        color: '#333', // Text color for contrast
    },
    studentCount: {
        fontSize: '1em',
        color: '#555',
        marginBottom: '15px',
        fontWeight: '500',
    },
    countCircle: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.85)', // White/Transparent center
        color: '#000',
        fontSize: '2em',
        fontWeight: '900',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)', // Circle shadow
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
    logoutButton: { 
        // Admin Dashboard Style
        position: 'absolute', 
        top: '30px', 
        right: '30px', 
        padding: '10px 18px', 
        backgroundColor: '#FF6347', 
        color: 'white', 
        border: 'none', 
        borderRadius: '25px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    },
};

export default HomeDashboard;
