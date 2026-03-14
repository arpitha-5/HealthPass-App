const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

exports.getPlans = async (req, res) => {
    try {
        const plans = await Plan.find();
        res.status(200).json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching plans', error: error.message });
    }
};

exports.createSubscription = async (req, res) => {
    try {
        const { planId, billingCycle } = req.body;
        const user = req.user;

        const plan = await Plan.findById(planId);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        // Calculate Expiry Date based on billingCycle
        let monthsToAdd = 1;
        if (billingCycle === 'Quarterly') monthsToAdd = 3;
        if (billingCycle === 'Annual') monthsToAdd = 12;

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);

        const subscription = new Subscription({
            user: user._id,
            plan: planId,
            billingCycle,
            expiryDate,
            visitsRemaining: plan.opdVisits || 10 // from plan or default
        });

        await subscription.save();

        res.status(201).json({ success: true, message: 'Subscription created', subscription });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating subscription', error: error.message });
    }
};
