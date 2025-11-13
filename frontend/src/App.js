// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import HomeDashboard from './components/HomeDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [currentPage, setCurrentPage] = useState('home'); // 'home', 'login', 'admin'

    useEffect(() => {
        // Check local storage on load
        const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
        if (isLoggedIn) {
            setIsAdminLoggedIn(true);
        }
    }, []);

    const handleLoginSuccess = () => {
        setIsAdminLoggedIn(true);
        setCurrentPage('admin'); // Navigate to Admin dashboard after login
    };

    const handleLogout = () => {
        localStorage.removeItem('isAdminLoggedIn');
        setIsAdminLoggedIn(false);
        setCurrentPage('home');
    };

    const renderContent = () => {
        if (currentPage === 'login') {
            return <LoginPage onLoginSuccess={handleLoginSuccess} />;
        }
        if (currentPage === 'admin') {
            return <AdminDashboard onLogout={handleLogout} />;
        }
        return <HomeDashboard />;
    };

    return (
        <div className="App" style={styles.appContainer}>
            <header style={styles.header}>
                <h1>KMV SCHOOL DRAMA REGISTRATIONS</h1>
                <nav>
                    <button onClick={() => setCurrentPage('home')} style={styles.navButton}>Home</button>
                    {isAdminLoggedIn ? (
                        <>
                            <button onClick={() => setCurrentPage('admin')} style={styles.navButton}>Admin Panel</button>
                            <button onClick={handleLogout} style={styles.navButton}>Logout</button>
                        </>
                    ) : (
                        <button onClick={() => setCurrentPage('login')} style={styles.navButton}>Admin Login</button>
                    )}
                </nav>
            </header>
            <main style={styles.mainContent}>
                {renderContent()}
            </main>
        </div>
    );
}

// Basic Styling for School Type (use CSS file for better practice)
const styles = {
    appContainer: {
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f0f0', // Light background
        minHeight: '100vh',
    },
    header: {
        backgroundColor: '#0056b3', // School blue
        color: 'white',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    navButton: {
        marginLeft: '10px',
        padding: '8px 15px',
        backgroundColor: 'white',
        color: '#0056b3',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    mainContent: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        minHeight: '85vh',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
    }
};

export default App;
