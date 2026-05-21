const Subscription = require('../models/Subscription');
const User = require('../models/User');

exports.getBenefits = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const subscription = await Subscription.findOne({ user: req.user._id, isActive: true }).populate('plan');

        if (!subscription) {
            return res.status(200).json({
                success: true,
                benefits: {
                    planBenefits: ['No active plan benefits'],
                    usageStats: {
                        consultationsUsed: 0,
                        consultationsTotal: 0,
                        walletCredits: user.walletBalance || 0,
                        familyMembersAdded: user.familyMembers ? user.familyMembers.length : 0,
                        familyMembersLimit: 0
                    }
                }
            });
        }

        const plan = subscription.plan;
        const planBenefits = [];

        if (plan.freeDoctorVisits > 0) {
            planBenefits.push(`${plan.freeDoctorVisits} Free Doctor Consultations/month`);
        }
        if (plan.diagnosticsCoverage > 0) {
            planBenefits.push(`${plan.diagnosticsCoverage}% Off on Lab & Diagnostics`);
        }
        if (plan.accidentalCover > 0) {
            planBenefits.push(`Accidental Coverage up to ₹${plan.accidentalCover.toLocaleString()}`);
        }
        if (plan.walletCreditPercentage > 0) {
            planBenefits.push(`${plan.walletCreditPercentage}% Wallet Credits Back on Transactions`);
        }
        if (plan.features && plan.features.length > 0) {
            planBenefits.push(...plan.features);
        }

        res.status(200).json({
            success: true,
            benefits: {
                planBenefits,
                usageStats: {
                    consultationsUsed: plan.freeDoctorVisits - subscription.visitsRemaining,
                    consultationsTotal: plan.freeDoctorVisits,
                    walletCredits: user.walletBalance || 0,
                    familyMembersAdded: user.familyMembers ? user.familyMembers.length : 0,
                    familyMembersLimit: plan.memberCoverage || 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching benefits', error: error.message });
    }
};
