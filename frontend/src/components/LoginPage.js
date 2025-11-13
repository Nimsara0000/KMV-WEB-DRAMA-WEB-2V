// frontend/src/components/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';

// 🛑 BASE URL එක ඔබගේ Render URL එකට සකස් කර ඇත
const BASE_URL = 'https://kmv-web-drama-web-2v.onrender.com'; 

const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Axios call to the deployed backend
            const res = await axios.post(`${BASE_URL}/api/admin/login`, { email }); 
            if (res.data.success) {
                localStorage.setItem('isAdminLoggedIn', 'true'); 
                onLoginSuccess();
            }
        } catch (err) {
            // 🛑 Error message එකේ ඇති email එක ඉවත් කර ඇත
            setError('Login Failed. Check the email provided.');
        }
    };

    return (
        <div style={styles.container}>
            <h2>🔐 Admin Login</h2>
            {/* 🛑 මෙහි පණිවිඩය "Use: admin only gmail" ලෙස වෙනස් කර ඇත */}
            <p style={styles.infoText}>Use: <strong>admin only gmail</strong></p>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="email"
                    placeholder="Enter Admin Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    required
                />
                <button type="submit" style={styles.button}>Login</button>
            </form>
            {error && <p style={styles.error}>{error}</p>}
        </div>
    );
};

// ✨ වැඩි දියුණු කළ විලාසිතා ✨
const styles = {
    container: { 
        maxWidth: '400px', 
        margin: '80px auto', 
        padding: '30px', 
        backgroundColor: 'white', 
        border: 'none', 
        borderRadius: '15px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)', 
        textAlign: 'center',
    },
    infoText: {
        // 🛑 මෙහි වර්ණය වෙනස් කර ඇත
        color: '#1E90FF', 
        marginBottom: '20px',
        fontSize: '1em',
        fontWeight: 'bold', // වඩාත් කැපී පෙනීමට
    },
    form: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px' 
    },
    input: { 
        padding: '12px', 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        fontSize: '1em',
    },
    button: { 
        padding: '12px', 
        backgroundColor: '#1E90FF', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer',
        fontSize: '1em',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
    },
    error: { 
        color: '#FF6347', 
        marginTop: '15px',
        fontWeight: 'bold',
    }
};

export default LoginPage;
