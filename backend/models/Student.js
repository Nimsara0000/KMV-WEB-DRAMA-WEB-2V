// backend/models/Student.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    grade: {
        type: String,
        required: true,
        enum: ['6 ශ්‍රේණිය', '7 ශ්‍රේණිය', '8 ශ්‍රේණිය', '9 ශ්‍රේණිය', '10 ශ්‍රේණිය', '11 ශ්‍රේණිය']
    },
    parentNameFather: {
        type: String,
        required: true
    },
    parentNameMother: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    studentPhoto: {
        type: String, // Storing the URL
        required: false
    },
    notes: {
        type: String,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
