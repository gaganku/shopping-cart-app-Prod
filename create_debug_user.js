const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connected to MongoDB');
        
        const username = 'testuser_debug';
        const email = 'gaganku2018ku@gmail.com';
        const password = 'password123';
        
        let user = await User.findOne({ username });
        if (user) {
            console.log('User exists, updating...');
            user.email = email;
            user.password = password;
            user.lastLogin = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000); // Force OTP
        } else {
            console.log('Creating new user...');
            user = new User({
                username,
                email,
                password,
                isAdmin: false,
                isVerified: true,
                lastLogin: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // Force OTP
            });
        }
        
        await user.save();
        console.log('User saved/updated');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
