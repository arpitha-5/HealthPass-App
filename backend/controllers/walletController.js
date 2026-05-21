const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const User = require('../models/User');

// Get User Wallet
exports.getWallet = async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ userId: req.user._id });
        
        if (!wallet) {
            // Create a default wallet for user
            wallet = new Wallet({
                userId: req.user._id,
                balance: req.user.walletBalance || 0,
                transactions: []
            });
            await wallet.save();
        }

        res.status(200).json({
            success: true,
            wallet: {
                balance: wallet.balance,
                transactions: wallet.transactions || []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching wallet', error: error.message });
    }
};

// Apply Wallet Credits (Debit)
exports.applyWallet = async (req, res) => {
    try {
        const { amount, type, referenceId } = req.body;
        
        let wallet = await Wallet.findOne({ userId: req.user._id });
        if (!wallet) {
            wallet = new Wallet({ userId: req.user._id, balance: req.user.walletBalance || 0 });
        }

        if (wallet.balance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
        }

        wallet.balance -= amount;
        wallet.transactions.push({
            amount,
            type: 'Debit',
            description: `Used for ${type || 'Service'}`,
            date: new Date()
        });

        await wallet.save();

        // Sync with User model
        await User.findByIdAndUpdate(req.user._id, { walletBalance: wallet.balance });

        // Save formal transaction log
        const transaction = new WalletTransaction({
            user: req.user._id,
            amount,
            type: 'DEBIT',
            reason: `Used for ${type || 'Service'}`,
            referenceId
        });
        await transaction.save();

        res.status(200).json({
            success: true,
            message: 'Wallet balance applied successfully',
            wallet: {
                balance: wallet.balance,
                transactions: wallet.transactions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error applying wallet credits', error: error.message });
    }
};

// Top Up Wallet (Credit)
exports.topUpWallet = async (req, res) => {
    try {
        const { amount } = req.body;
        
        let wallet = await Wallet.findOne({ userId: req.user._id });
        if (!wallet) {
            wallet = new Wallet({ userId: req.user._id, balance: req.user.walletBalance || 0 });
        }

        wallet.balance += Number(amount);
        wallet.transactions.push({
            amount: Number(amount),
            type: 'Credit',
            description: 'Wallet top-up',
            date: new Date()
        });

        await wallet.save();

        // Sync with User model
        await User.findByIdAndUpdate(req.user._id, { walletBalance: wallet.balance });

        // Save formal transaction log
        const transaction = new WalletTransaction({
            user: req.user._id,
            amount: Number(amount),
            type: 'CREDIT',
            reason: 'Wallet top-up'
        });
        await transaction.save();

        res.status(200).json({
            success: true,
            message: 'Wallet topped up successfully',
            wallet: {
                balance: wallet.balance,
                transactions: wallet.transactions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error topping up wallet', error: error.message });
    }
};
