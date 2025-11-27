require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    
    try {
        // Check if admin user already exists
        let adminUser = await User.findOne({ username: 'admin' });
        
        if (adminUser) {
            console.log('Admin user already exists');
            if (!adminUser.isAdmin) {
                adminUser.isAdmin = true;
                await adminUser.save();
                console.log('✅ Set existing admin user as admin');
            } else {
                console.log('✅ Admin user is already an admin');
            }
        } else {
            // Create new admin user
            adminUser = new User({
                username: 'admin',
                email: 'admin@example.com',
                password: 'admin',
                isVerified: true,
                isAdmin: true
            });
            
            await adminUser.save();
            console.log('✅ Created new admin user!');
        }
        
        console.log('\n📋 Admin Credentials:');
        console.log('========================');
        console.log('Username: admin');
        console.log('Password: admin');
        console.log('Email: admin@example.com');
        console.log('\n🔗 Access admin dashboard at: http://localhost:3000/admin.html');
        
    } catch (err) {
        console.error('Error creating admin:', err);
    } finally {
        mongoose.connection.close();
    }
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
