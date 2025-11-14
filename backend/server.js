// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

// 🛑 Frontend Vercel URL එක නිවැරදිව මෙහි සඳහන් කර ඇත
const VERCEL_FRONTEND_URL = 'https://kmv-drama-web-ivory.vercel.app';

// MongoDB URL (ඔබ ලබා දුන් URL එක)
const mongoURI = 'mongodb+srv://nimatest:nimatest@nimatest.bdf6c2a.mongodb.net/'; 

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('💚 MongoDB connected successfully.');
    } catch (err) {
        console.error('💔 MongoDB connection error:', err.message);
        process.exit(1); 
    }
};
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io Server Setup
// Socket.io සඳහා CORS සැකසීම - Vercel URL එකට සකසා ඇත
const io = new Server(server, {
    cors: {
        origin: VERCEL_FRONTEND_URL, // ✅ නිවැරදි කිරීම
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true, // අවශ්‍ය නම්, cookie/header credentials සඳහා
    }
});

// Middleware
app.use(express.json()); 

// Express CORS Middleware සැකසීම - Vercel URL එකට සකසා ඇත
app.use(cors({ 
    origin: VERCEL_FRONTEND_URL, // ✅ නිවැරදි කිරීම
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // අවශ්‍ය නම්
})); 

// Inject socket.io into request object to use in controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
const studentRoutes = require('./routes/studentRoutes');
app.use('/api/students', studentRoutes);

// Admin Login (Hardcoded as per request: nimanimaowner@gmail.com)
app.post('/api/admin/login', (req, res) => {
    const { email } = req.body;
    if (email === 'nimanimaowner@gmail.com') {
        // Sends a success flag back to the frontend
        return res.json({ success: true, message: 'Login successful' });
    }
    res.status(401).json({ success: false, message: 'Invalid Admin Email' });
});

// Socket.io Connection listener
io.on('connection', (socket) => {
    console.log('A user connected via WebSocket:', socket.id);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`⚡ Server running on port ${PORT}`));
