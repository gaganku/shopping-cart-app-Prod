const axios = require('axios');

async function testVerify2FA() {
    const baseUrl = 'http://localhost:3000';

    console.log('--- Testing /api/auth/verify-2fa ---');

    // Test 1: Missing userId and OTP
    try {
        console.log('\nTest 1: Sending empty body...');
        await axios.post(`${baseUrl}/api/auth/verify-2fa`, {});
    } catch (err) {
        console.log('Result:', err.response ? err.response.data : err.message);
    }

    // Test 2: Missing userId, valid OTP format
    try {
        console.log('\nTest 2: Sending OTP only (no userId)...');
        await axios.post(`${baseUrl}/api/auth/verify-2fa`, { otp: '123456' });
    } catch (err) {
        console.log('Result:', err.response ? err.response.data : err.message);
    }

    // Test 3: Valid userId (fake) and OTP
    try {
        console.log('\nTest 3: Sending fake userId and OTP...');
        // Use a fake Mongo ObjectId
        const fakeId = '507f1f77bcf86cd799439011'; 
        await axios.post(`${baseUrl}/api/auth/verify-2fa`, { 
            userId: fakeId, 
            otp: '123456' 
        });
    } catch (err) {
        console.log('Result:', err.response ? err.response.data : err.message);
    }
}

testVerify2FA();
