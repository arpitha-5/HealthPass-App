const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String, // e.g., "10:00 AM"
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    type: {
        type: String,
        enum: ['In-person', 'Video Call'],
        default: 'In-person'
    },
    hospital: {
        type: String,
        default: 'Apollo Hospitals'
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
