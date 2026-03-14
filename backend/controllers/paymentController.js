const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Plan = require('../models/Plan');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_placeholder',
});

exports.createOrder = async (req, res) => {
    try {
        const { planId, billingCycle } = req.body;
        const plan = await Plan.findById(planId);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        const amount = plan.price[billingCycle.toLowerCase()] * 100; // in paisa
        const options = {
            amount,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating Razorpay order', error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planId,
            billingCycle
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_placeholder')
            .update(sign.toString())
            .digest("hex");

        const isMock = razorpay_signature === 'mock_signature';

        if (razorpay_signature === expectedSign || isMock) {
            // Payment verified (or mock accepted for testing)
            const plan = await Plan.findById(planId);

            // Calculate expiry
            let monthsToAdd = 1;
            if (billingCycle === 'Quarterly') monthsToAdd = 3;
            if (billingCycle === 'Annual') monthsToAdd = 12;

            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);

            const subscription = new Subscription({
                user: req.user._id,
                plan: planId,
                billingCycle,
                expiryDate,
                visitsRemaining: plan.opdVisits,
                isActive: true
            });

            await subscription.save();

            // Update user
            await User.findByIdAndUpdate(req.user._id, {
                currentSubscription: subscription._id,
                isProfileComplete: true
            });

            // Save payment record
            const payment = new Payment({
                user: req.user._id,
                subscription: subscription._id,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                amount: plan.price[billingCycle.toLowerCase()],
                status: 'Success'
            });
            await payment.save();

            res.status(200).json({ success: true, message: 'Payment verified and subscription activated', subscription });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error verifying payment', error: error.message });
    }
};
