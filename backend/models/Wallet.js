const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0
    },
    transactions: [{
        amount: Number,
        type: {
            type: String,
            enum: ['Credit', 'Debit']
        },
        description: String,
        date: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('Wallet', WalletSchema);
