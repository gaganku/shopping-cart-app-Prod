require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createRegularUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart');
        console.log('Connected to MongoDB');

        const username = 'testuser';
        const password = 'test123';
        const email = 'testuser@example.com';

        // Check if user exists
        let user = await User.findOne({ username });
        
        if (user) {
            console.log('User already exists. Updating...');
            user.password = password;
            user.isAdmin = false;
            user.isAdminVerified = true;
            user.isVerified = true;
            user.email = email;
            user.displayName = 'Test User';
            user.lastLogin = new Date();
            await user.save();
            console.log('User updated successfully');
        } else {
            console.log('Creating new user...');
            user = new User({
                username,
                password,
                email,
                displayName: 'Test User',
                isAdmin: false,
                isAdminVerified: true,
                isVerified: true,
                lastLogin: new Date()
            });
            await user.save();
            console.log('User created successfully');
        }

        console.log('\n=================================');
        console.log('Regular User Credentials:');
        console.log('=================================');
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('Email:', email);
        console.log('Admin:', user.isAdmin);
        console.log('=================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createRegularUser();
