const axios = require('axios');

async function testSignup() {
    try {
        const res = await axios.post('http://127.0.0.1:5000/api/auth/signup', {
            name: 'Test User',
            phoneNumber: '+911234567890',
            email: 'test@example.com'
        });
        console.log('Signup success:', res.data);
    } catch (e) {
        console.error('Signup failed:', e.response?.data || e.message);
    }
}

testSignup();
