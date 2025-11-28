const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function testOTPLogic() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart');
        console.log('Connected to DB\n');

        // Find the 'gagan' user for testing
        const user = await User.findOne({ username: 'gagan' });
        
        if (!user) {
            console.log('User "gagan" not found');
            process.exit(1);
        }

        console.log('Current user state:');
        console.log('Username:', user.username);
        console.log('Email:', user.email);
        console.log('Password:', user.password);
        console.log('Last Login:', user.lastLogin);
        console.log('Created At:', user.createdAt);
        
        const now = new Date();
        const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000);
        const daysSinceLogin = user.lastLogin ? Math.floor((now - user.lastLogin) / (1000 * 60 * 60 * 24)) : 'Never';
        
        console.log('\nAnalysis:');
        console.log('Days since last login:', daysSinceLogin);
        console.log('10 days ago threshold:', tenDaysAgo);
        console.log('Should require OTP?', !user.lastLogin || user.lastLogin < tenDaysAgo ? 'YES' : 'NO');
        
        // Test Scenario 1: Set lastLogin to 5 days ago (should NOT require OTP)
        console.log('\n--- Test Scenario 1: Recent Login (5 days ago) ---');
        const fiveDaysAgo = new Date(now - 5 * 24 * 60 * 60 * 1000);
        user.lastLogin = fiveDaysAgo;
        await user.save();
        console.log('Set lastLogin to:', fiveDaysAgo);
        console.log('Expected: Direct login (no OTP)');
        
        // Test Scenario 2: Set lastLogin to 15 days ago (should require OTP)
        console.log('\n--- Test Scenario 2: Old Login (15 days ago) ---');
        const fifteenDaysAgo = new Date(now - 15 * 24 * 60 * 60 * 1000);
        user.lastLogin = fifteenDaysAgo;
        await user.save();
        console.log('Set lastLogin to:', fifteenDaysAgo);
        console.log('Expected: Require OTP');
        
        console.log('\n✅ Test setup complete!');
        console.log('\nNow you can test by logging in with:');
        console.log('Username: gagan');
        console.log('Password:', user.password);
        console.log('\nThe system should require OTP since lastLogin is 15 days old.');
        
        process.exit(0);
    } catch (err) {
        console.error('Test error:', err);
        process.exit(1);
    }
}

testOTPLogic();
