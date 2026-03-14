const mongoose = require('mongoose');

const WalletTransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
    reason: { type: String, required: true },
    referenceId: { type: String } // e.g. DiagnosticBill ID or Payment ID
}, { timestamps: true });

module.exports = mongoose.model('WalletTransaction', WalletTransactionSchema);
