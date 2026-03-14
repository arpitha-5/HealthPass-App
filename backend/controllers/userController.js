const User = require('../models/User');
const FamilyMember = require('../models/FamilyMember');
const InsurancePolicy = require('../models/InsurancePolicy');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

exports.getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('currentSubscription');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Fetch nearby hospitals
        const hospitals = await Hospital.find().limit(5);

        // Fetch doctors
        const doctors = await Doctor.find().limit(5);

        // Fetch latest appointment
        const latestAppointment = await Appointment.findOne({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('doctor');

        let appointment = null;
        if (latestAppointment) {
            appointment = {
                doctor: latestAppointment.doctor?.name || 'Doctor',
                hospital: latestAppointment.hospital || 'Hospital',
                time: `${new Date(latestAppointment.date).toLocaleDateString()}, ${latestAppointment.time}`
            };
        } else {
            appointment = {
                doctor: 'No upcoming',
                hospital: 'Book one now',
                time: ''
            };
        }

        res.status(200).json({
            success: true,
            dashboard: {
                user: {
                    fullName: user.fullName || user.name,
                    name: user.name,
                    avatar: user.avatar || user.profilePicture,
                    walletBalance: user.walletBalance,
                    currentSubscription: user.currentSubscription,
                },
                hospitals,
                doctors,
                appointment
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching dashboard data', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('currentSubscription')
            .populate('familyMembers')
            .populate('insurancePolicies');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    const { 
        fullName, 
        name, 
        email, 
        phone, 
        dob, 
        gender, 
        address, 
        emergencyContact, 
        city, 
        profilePicture, 
        avatar 
    } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update fields
        if (fullName) user.fullName = fullName;
        if (name) user.name = name; // Sync if only name provided
        if (!user.fullName && name) user.fullName = name;
        if (user.fullName && !name) user.name = user.fullName;

        if (email) user.email = email;
        if (phone || req.body.mobileNumber) user.mobileNumber = phone || req.body.mobileNumber;
        if (dob) user.dob = dob;
        if (gender) user.gender = gender;
        if (address) user.address = address;
        if (emergencyContact) user.emergencyContact = emergencyContact;
        if (city) user.city = city;
        if (profilePicture) user.profilePicture = profilePicture;
        if (avatar) user.avatar = avatar;

        user.isProfileComplete = true;

        await user.save();
        res.status(200).json({ success: true, message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
    }
};

// --- Family Members ---

exports.addFamilyMember = async (req, res) => {
    try {
        const { name, age, relationship } = req.body;

        const newFamilyMember = new FamilyMember({
            user: req.user._id,
            name,
            age,
            relationship
        });

        await newFamilyMember.save();

        const user = await User.findById(req.user._id);
        user.familyMembers.push(newFamilyMember._id);
        await user.save();

        res.status(201).json({ success: true, message: 'Family member added', familyMember: newFamilyMember });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding family member', error: error.message });
    }
};

exports.getFamilyMembers = async (req, res) => {
    try {
        const familyMembers = await FamilyMember.find({ user: req.user._id });
        res.status(200).json({ success: true, familyMembers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching family members', error: error.message });
    }
};

// --- Insurance Policies ---

exports.addInsurancePolicy = async (req, res) => {
    try {
        const { provider, policyNumber } = req.body;

        const newPolicy = new InsurancePolicy({
            user: req.user._id,
            provider,
            policyNumber
        });

        await newPolicy.save();

        const user = await User.findById(req.user._id);
        user.insurancePolicies.push(newPolicy._id);
        await user.save();

        res.status(201).json({ success: true, message: 'Insurance policy added', insurancePolicy: newPolicy });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding insurance policy', error: error.message });
    }
};

exports.getInsurancePolicies = async (req, res) => {
    try {
        const insurancePolicies = await InsurancePolicy.find({ user: req.user._id });
        res.status(200).json({ success: true, insurancePolicies });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching insurance policies', error: error.message });
    }
};
