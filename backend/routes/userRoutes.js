const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    addFamilyMember,
    getFamilyMembers,
    addInsurancePolicy,
    getInsurancePolicies,
    getDashboard
} = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/dashboard', auth, getDashboard);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/update-profile', auth, updateProfile);

router.post('/family', auth, addFamilyMember);
router.get('/family', auth, getFamilyMembers);

router.post('/insurance', auth, addInsurancePolicy);
router.get('/insurance', auth, getInsurancePolicies);

module.exports = router;
