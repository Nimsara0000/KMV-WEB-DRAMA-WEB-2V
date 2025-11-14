// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import HomeDashboard from './components/HomeDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    // 'home', 'login', 'admin'
    const [currentPage, setCurrentPage] = useState('home'); 

    useEffect(() => {
        // Local storage වෙතින් adminToken එකක් තිබේදැයි පරීක්ෂා කරයි.
        const token = localStorage.getItem('adminToken');
        if (token) {
            setIsAdminLoggedIn(true);
            // Admin Token එක තිබුණත්, අපි මුලින්ම Dashboard එක පෙන්වමු.
            setCurrentPage('home'); 
        }
    }, []);

    const handleLoginSuccess = () => {
        // Login සාර්ථක වූ විට, Token එකක් ලෙස 'true' save කරමු
        localStorage.setItem('adminToken', 'true'); 
        setIsAdminLoggedIn(true);
        setCurrentPage('admin'); // Login වූ පසු Admin Dashboard වෙත යන්න
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken'); // Token ඉවත් කිරීම
        setIsAdminLoggedIn(false);
        setCurrentPage('home'); // Logout වූ පසු Home වෙත යන්න
    };
    
    // 🛑 HomeDashboard වෙත යැවිය යුතු Navigation Props
    const navigationProps = {
        // Admin Login වී ඇත්දැයි HomeDashboard එකට දැනුම් දීමට
        isAdminLoggedIn: isAdminLoggedIn, 
        // Logout කිරීමට අවශ්‍ය function එක
        onLogout: handleLogout,
        // පිටු මාරු කිරීමට අවශ්‍ය function එක (Hamburger Menu මගින් භාවිත කරයි)
        setCurrentPage: setCurrentPage,
    };

    const renderContent = () => {
        // LoginPage එක
        if (currentPage === 'login') {
            return (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
            );
        }
        
        // Admin Dashboard එක
        if (currentPage === 'admin') {
            // Admin Dashboard එකට Header එකක් අවශ්‍ය නම්,
            // HomeDashboard එකේ Header එක වෙනම component එකක් ලෙස සාදා මෙහිදීද භාවිතා කළ හැකිය.
            // දැනට, AdminDashboard එකට Logout function එක යවමු.
            return (
                // 🛑 ඔබට අවශ්‍ය නම්, AdminDashboard එකට HomeDashboard හි navigationProps යැවිය හැක.
                <AdminDashboard onLogout={handleLogout} />
            );
        }
        
        // Home Dashboard එක
        // HomeDashboard වෙත සියලු navigation props යවමු (Hamburger Menu ක්‍රියාත්මක වීමට)
        return <HomeDashboard {...navigationProps} />;
    };

    return (
        <div className="App" style={styles.appContainer}>
            {/* 🛑 පැරණි <header> element එක සම්පූර්ණයෙන්ම ඉවත් කර ඇත. 
                 දැන් Header එක පාලනය කරන්නේ HomeDashboard.js මගිනි. */}
            
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
        // HomeDashboard background එකට ගැලපෙන පරිදි
        backgroundColor: '#f0f2f5', 
        minHeight: '100vh',
    },
    
    // 🛑 Header/Navigation සඳහා වූ සියලු styles ඉවත් කර ඇත.
    
    mainContent: {
        // HomeDashboard එකේ padding/margin කළමනාකරණය කිරීමට
        padding: '0', 
        maxWidth: '100%',
        margin: '0 auto', 
        backgroundColor: 'transparent',
        minHeight: '100vh',
        overflow: 'hidden',
    }
};

export default App;
