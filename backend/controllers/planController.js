const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

const mapPlanForClient = (plan) => {
    if (!plan) return null;
    const planObj = plan.toObject ? plan.toObject() : plan;
    
    // Choose appropriate colors based on name
    let color = '#6B7280'; // Default Silver
    if (planObj.name === 'Gold') color = '#F59E0B';
    if (planObj.name === 'Platinum') color = '#7C3AED';
    if (planObj.name === 'Plus') color = '#10B981';
    if (planObj.name === 'Premium') color = '#EF4444';
    if (planObj.name === 'Advanced') color = '#3B82F6';
    if (planObj.name === 'Enhanced') color = '#8B5CF6';

    const monthlyPrice = planObj.price?.monthly || 299;
    const quarterlyPrice = planObj.price?.quarterly || 799;
    const annualPrice = planObj.price?.annual || 2499;

    return {
        ...planObj,
        price: monthlyPrice, // Return monthly price as the flat price to avoid react child crash!
        priceMonthly: monthlyPrice,
        priceQuarterly: quarterlyPrice,
        priceAnnually: annualPrice,
        duration: 'month',
        displayName: planObj.name,
        color,
        popular: planObj.name === 'Gold',
        badge: planObj.name === 'Gold' ? 'POPULAR' : planObj.name === 'Platinum' ? 'PREMIUM' : '',
        maxMembers: planObj.memberCoverage || 1,
        maxAdults: planObj.memberCoverage || 1,
        maxChildren: 0,
        freeVisits: planObj.freeDoctorVisits || 0,
        networkType: planObj.name === 'Platinum' ? 'premium' : 'network',
        medical: {
            bloodTestsDiscount: planObj.diagnosticsCoverage || 0,
            healthCheckupDiscount: planObj.diagnosticsCoverage || 0,
            diagnosticsDiscount: planObj.diagnosticsCoverage || 0,
            freeHealthCheckups: planObj.name === 'Platinum' ? 4 : planObj.name === 'Gold' ? 2 : 0
        },
        features: {
            freeVisits: planObj.freeDoctorVisits || 0,
            priorityLine: planObj.name === 'Platinum' || planObj.name === 'Gold',
            claimTracking: true,
            walletCredits: planObj.name === 'Platinum' ? 500 : planObj.name === 'Gold' ? 200 : 50
        },
        extraFeatures: {
            aiSupport: planObj.name === 'Platinum' || planObj.name === 'Gold',
            reminders: true,
            healthTracking: true,
            walletRewards: true
        },
        accidentalCoverage: {
            enabled: planObj.accidentalCover > 0,
            maxAmount: planObj.accidentalCover || 0,
            claimLimit: planObj.accidentalCover > 100000 ? 3 : 2
        },
        limitations: {
            maxClaimsPerYear: planObj.name === 'Platinum' ? 50 : 10,
            waitingPeriodDays: planObj.name === 'Platinum' ? 0 : 15,
            exclusions: planObj.name === 'Platinum' ? [] : ['International treatments']
        }
    };
};

exports.getPlans = async (req, res) => {
    try {
        const plans = await Plan.find();
        const mappedPlans = plans.map(plan => mapPlanForClient(plan));
        res.status(200).json({ success: true, plans: mappedPlans });
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
        if (billingCycle === 'Quarterly' || billingCycle === 'QUARTERLY') monthsToAdd = 3;
        if (billingCycle === 'Annual' || billingCycle === 'ANNUAL') monthsToAdd = 12;

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);

        const subscription = new Subscription({
            user: user._id,
            plan: planId,
            billingCycle: billingCycle === 'MONTHLY' ? 'Monthly' : billingCycle === 'QUARTERLY' ? 'Quarterly' : billingCycle === 'ANNUAL' ? 'Annual' : billingCycle,
            expiryDate,
            visitsRemaining: plan.freeDoctorVisits || 10
        });

        await subscription.save();

        const populatedSubscription = await Subscription.findById(subscription._id).populate('plan');
        if (populatedSubscription && populatedSubscription.plan) {
            populatedSubscription.plan = mapPlanForClient(populatedSubscription.plan);
        }

        res.status(201).json({ 
            success: true, 
            message: 'Subscription created', 
            subscription: populatedSubscription 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating subscription', error: error.message });
    }
};

exports.getPlanDetails = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.planId);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        res.status(200).json({ success: true, plan: mapPlanForClient(plan) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching plan', error: error.message });
    }
};

exports.getActiveSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ user: req.user._id, isActive: true }).populate('plan');
        
        if (subscription && subscription.plan) {
            subscription.plan = mapPlanForClient(subscription.plan);
        }

        res.status(200).json({ 
            success: true, 
            subscription, 
            subscriptions: subscription ? [subscription] : [] 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching active subscription', error: error.message });
    }
};

exports.cancelSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOneAndUpdate(
            { user: req.user._id, isActive: true },
            { isActive: false },
            { new: true }
        ).populate('plan');

        if (subscription && subscription.plan) {
            subscription.plan = mapPlanForClient(subscription.plan);
        }

        res.status(200).json({ success: true, message: 'Subscription cancelled successfully', subscription });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error cancelling subscription', error: error.message });
    }
};
