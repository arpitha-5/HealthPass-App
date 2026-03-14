const FamilyMember = require('../models/FamilyMember');

exports.getFamilyMembers = async (req, res) => {
    try {
        const familyMembers = await FamilyMember.find({ user: req.user._id });
        res.status(200).json({ success: true, familyMembers });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching family members', error: error.message });
    }
};

exports.addFamilyMember = async (req, res) => {
    const { name, age, relationship } = req.body;
    try {
        const familyMember = new FamilyMember({
            user: req.user._id,
            name,
            age,
            relationship
        });
        await familyMember.save();
        res.status(201).json({ success: true, familyMember });
    } catch (error) {
        res.status(500).json({ message: 'Error adding family member', error: error.message });
    }
};

exports.deleteFamilyMember = async (req, res) => {
    try {
        const familyMember = await FamilyMember.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id // Ensure user owns the record
        });

        if (!familyMember) {
            return res.status(404).json({ success: false, message: 'Family member not found' });
        }

        res.status(200).json({ success: true, message: 'Family member removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting family member', error: error.message });
    }
};
