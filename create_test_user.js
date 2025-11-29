require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createTestUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart');
        console.log('Connected to MongoDB');

        const username = 'admin_test';
        const password = 'admin123';
        const email = 'admin_test@example.com';

        // Check if user exists
        let user = await User.findOne({ username });
        
        if (user) {
            console.log('User already exists. Updating...');
            user.password = password; // In a real app, hash this! But for this test app it seems plain text based on server.js
            user.isAdmin = true;
            user.isAdminVerified = true;
            user.isVerified = true;
            user.email = email;
            user.lastLogin = new Date(); // Set last login to now to avoid 2FA
            await user.save();
            console.log('User updated successfully');
        } else {
            console.log('Creating new user...');
            user = new User({
                username,
                password, // Plain text as per server.js logic
                email,
                isAdmin: true,
                isAdminVerified: true,
                isVerified: true,
                lastLogin: new Date() // Set last login to now to avoid 2FA
            });
            await user.save();
            console.log('User created successfully');
        }

        console.log('Credentials:');
        console.log('Username:', username);
        console.log('Password:', password);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestUser();
