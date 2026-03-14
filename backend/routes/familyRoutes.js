const express = require('express');
const router = express.Router();
const { getFamilyMembers, addFamilyMember, deleteFamilyMember } = require('../controllers/familyController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getFamilyMembers);
router.post('/', auth, addFamilyMember);
router.delete('/:id', auth, deleteFamilyMember);

module.exports = router;
