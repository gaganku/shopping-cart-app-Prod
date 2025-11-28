const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function migrateLastLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart');
        console.log('Connected to DB');

        // Find all users without lastLogin
        const usersWithoutLastLogin = await User.find({ lastLogin: { $exists: false } });
        
        console.log(`Found ${usersWithoutLastLogin.length} users without lastLogin`);

        // Update each user
        for (const user of usersWithoutLastLogin) {
            user.lastLogin = user.createdAt;
            await user.save();
            console.log(`Updated ${user.username} - lastLogin set to ${user.createdAt}`);
        }

        console.log('\nMigration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    }
}

migrateLastLogin();
