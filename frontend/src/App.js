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
                {/* 🛑 nav element එක display: flex; ලෙස ක්‍රියා කරන නිසා බොත්තම් හරහට පවතී */}
                <nav style={styles.navBar}>
                    <button onClick={() => setCurrentPage('home')} style={styles.navButton}>Home</button>
                    {isAdminLoggedIn ? (
                        <>
                            <button onClick={() => setCurrentPage('admin')} style={styles.navButton}>Admin Panel</button>
                            {/* Logout බොත්තම වෙනත් style එකකින් */}
                            <button onClick={handleLogout} style={styles.navButtonLogout}>Logout</button>
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

// ✨ යාවත්කාලීන කළ විලාසිතා (Styles) ✨
const styles = {
    appContainer: {
        fontFamily: 'Roboto, Arial, sans-serif',
        // පසුබිම index.css මගින් පාලනය කරයි (Gradient)
        backgroundColor: 'transparent', 
        minHeight: '100vh',
    },
    header: {
        backgroundColor: '#1E90FF', // Royal Blue
        color: 'white',
        padding: '20px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        // කැපී පෙනෙන සෙවණැල්ල
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)', 
    },
    navBar: {
        // බොත්තම් හරහට තබා ගැනීමට (navBar එකක් ලෙස)
        display: 'flex',
        gap: '15px', // බොත්තම් අතර ඉඩ
    },
    // Home සහ Admin Panel බොත්තම් සඳහා
    navButton: {
        padding: '10px 18px',
        backgroundColor: 'white',
        color: '#1E90FF', 
        border: '2px solid white', 
        borderRadius: '25px', // Rounded buttons
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    },
    // Logout බොත්තම සඳහා (වෙනස් වර්ණයකින් කැපී පෙනීමට)
    navButtonLogout: {
        padding: '10px 18px',
        backgroundColor: '#FF6347', // Tomato Red
        color: 'white',
        border: '2px solid #FF6347',
        borderRadius: '25px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    },
    mainContent: {
        padding: '30px',
        maxWidth: '1200px',
        margin: '30px auto', 
        backgroundColor: 'white',
        minHeight: '80vh',
        borderRadius: '12px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)', 
        overflow: 'hidden',
    }
};

export default App;
