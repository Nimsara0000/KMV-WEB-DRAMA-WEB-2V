// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

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
// Frontend (React) එක http://localhost:3000 හි ධාවනය වන බව සලකයි
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", 
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Middleware
app.use(express.json()); 
app.use(cors({ origin: "http://localhost:3000" })); 

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
