// frontend/src/components/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';

const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Uses the hardcoded login route created in server.js
            const res = await axios.post('http://localhost:5000/api/admin/login', { email }); 
            if (res.data.success) {
                // Set the flag in local storage and call the parent function
                localStorage.setItem('isAdminLoggedIn', 'true'); 
                onLoginSuccess();
            }
        } catch (err) {
            setError('Login Failed. Check the email (nimanimaowner@gmail.com).');
        }
    };

    return (
        <div style={styles.container}>
            <h2>🔑 Admin Login</h2>
            <p>Use: <strong>nimanimaowner@gmail.com</strong></p>
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

const styles = {
    container: { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px' },
    button: { padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    error: { color: 'red', marginTop: '10px' }
};

export default LoginPage;
