const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    
    // Create test users
    const testUsers = [
        {
            username: 'testuser1',
            email: 'testuser1@example.com',
            password: 'password123',
            isVerified: true,
            mustChangePassword: false
        },
        {
            username: 'testuser2',
            email: 'testuser2@example.com',
            password: 'password123',
            isVerified: true,
            mustChangePassword: false
        },
        {
            username: 'testuser3',
            email: 'testuser3@example.com',
            password: 'password123',
            isVerified: true,
            mustChangePassword: false
        },
        {
            username: 'testuser4',
            email: 'testuser4@example.com',
            password: 'password123',
            isVerified: true,
            mustChangePassword: false
        }
    ];
    
    for (const userData of testUsers) {
        const existingUser = await User.findOne({ username: userData.username });
        if (!existingUser) {
            const user = new User(userData);
            await user.save();
            console.log(`Created user: ${userData.username}`);
        } else {
            console.log(`User already exists: ${userData.username}`);
        }
    }
    
    console.log('Test users created successfully');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
