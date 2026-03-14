const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    experience: {
        type: Number,
        required: true
    },
    fee: {
        type: Number,
        required: true
    },
    about: {
        type: String,
        default: ''
    },
    profilePicture: {
        type: String,
        default: ''
    },
    availableSlots: {
        type: [String],
        default: ["10:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"]
    }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
