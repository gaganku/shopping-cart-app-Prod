require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createTestUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart');
        console.log('Connected to MongoDB');

        // Delete existing test user
        await User.deleteOne({ username: 'emailtest' });
        
        // Create new test user
        const user = new User({
            username: 'emailtest',
            email: 'gaganku2018ku@gmail.com',
            password: 'Test1234',
            isVerified: false,
            lastLogin: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
        });
        
        await user.save();
        console.log('✅ Test user created:');
        console.log('   Username: emailtest');
        console.log('   Password: Test1234');
        console.log('   Email:', user.email);
        console.log('\nNow login with this user - it will send OTP email!');
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

createTestUser();
