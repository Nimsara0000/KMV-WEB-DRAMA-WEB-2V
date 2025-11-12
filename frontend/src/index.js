// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // ඔබට index.css එකක් ඇත්නම්, එයද එකතු කළ යුතුයි
import App from './App'; // App.js එකද අත්‍යවශ්‍යයි
import reportWebVitals from './reportWebVitals';

// React 18+ syntax
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App /> 
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
reportWebVitals();
