const mongoose = require('mongoose');

const DiagnosticBillSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    creditsAdded: { type: Number, default: 0 },
    verifiedBy: { type: String },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DiagnosticBill', DiagnosticBillSchema);
