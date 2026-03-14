const axios = require('axios');

const API_URL = 'http://127.0.0.1:5000/api';

async function test() {
    try {
        console.log('--- Testing Health Check ---');
        const health = await axios.get(`${API_URL}/health`);
        console.log('Status:', health.status, 'Message:', health.data.message);

        console.log('\n--- Testing Plans API ---');
        const plans = await axios.get(`${API_URL}/plans`);
        console.log('Status:', plans.status, 'Plans Found:', plans.data.plans.length);
        plans.data.plans.forEach(p => console.log(`- ${p.name}: ₹${p.price.monthly}/mo`));

        console.log('\n--- Testing Phone Login ---');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            phoneNumber: '+919876543210',
            name: 'Test User',
        });
        console.log('Status:', loginRes.status, 'Token Received:', !!loginRes.data.token);
        const token = loginRes.data.token;

        console.log('\n--- Testing Protected Profile ---');
        const profileRes = await axios.get(`${API_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Status:', profileRes.status, 'User Name:', profileRes.data.user.name);

        console.log('\n--- ALL BACKEND TESTS PASSED SUCCESSFULLY! ---');
    } catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
}

test();
