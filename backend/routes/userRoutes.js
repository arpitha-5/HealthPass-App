const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    addFamilyMember,
    getFamilyMembers,
    deleteFamilyMember,
    addInsurancePolicy,
    getInsurancePolicies,
    getDashboard
} = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/dashboard', auth, getDashboard);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.patch('/profile', auth, updateProfile); // Added for mobile-app compatibility
router.post('/setup', auth, updateProfile); // Added for mobile-app complete-signup compatibility
router.put('/update-profile', auth, updateProfile);

router.post('/family', auth, addFamilyMember);
router.get('/family', auth, getFamilyMembers);
router.delete('/family/:id', auth, deleteFamilyMember); // Added for mobile-app compatibility

router.post('/insurance', auth, addInsurancePolicy);
router.get('/insurance', auth, getInsurancePolicies);

module.exports = router;
