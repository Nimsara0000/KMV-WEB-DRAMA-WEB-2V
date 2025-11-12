// backend/controllers/studentController.js
const Student = require('../models/Student');

// Utility function to fetch all students and broadcast them via Socket.io
const emitUpdate = (io) => {
    // Sort by grade and name
    Student.find().sort({ grade: 1, fullName: 1 }) 
        .then(students => {
            // Broadcast the entire updated list to all connected clients
            io.emit('students_updated', students);
        })
        .catch(err => console.error('Error fetching students for real-time update:', err));
};

// GET /api/students - Get all students (Public)
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ grade: 1, fullName: 1 });
        res.json(students);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// POST /api/students - Add new student (Admin)
exports.addStudent = async (req, res) => {
    try {
        const newStudent = new Student(req.body);
        const student = await newStudent.save();
        
        // Real-time update - IMPORTANT
        emitUpdate(req.io); 
        
        res.json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// PUT /api/students/:id - Update student (Admin)
exports.updateStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true } 
        );
        if (!student) return res.status(404).json({ msg: 'Student not found' });

        // Real-time update - IMPORTANT
        emitUpdate(req.io);

        res.json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// DELETE /api/students/:id - Delete student (Admin)
exports.deleteStudent = async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);

        // Real-time update - IMPORTANT
        emitUpdate(req.io);

        res.json({ msg: 'Student removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
