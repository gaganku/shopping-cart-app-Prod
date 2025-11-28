const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function setRecentLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart');
        console.log('Connected to DB');

        const user = await User.findOne({ username: 'gagan' });
        
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        // Set lastLogin to 2 days ago (within 10 days)
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        user.lastLogin = twoDaysAgo;
        await user.save();

        console.log('✅ Set lastLogin to 2 days ago:', twoDaysAgo);
        console.log('Now login should work directly without OTP');
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

setRecentLogin();
