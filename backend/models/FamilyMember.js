const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    relationship: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
