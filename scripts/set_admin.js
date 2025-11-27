require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    
    // Get username from command line argument or use default
    const username = process.argv[2];
    
    if (!username) {
        console.error('Please provide a username: node scripts/set_admin.js <username>');
        process.exit(1);
    }
    
    try {
        // Find user and set as admin
        const user = await User.findOne({ username });
        
        if (!user) {
            console.error(`User '${username}' not found`);
            process.exit(1);
        }
        
        user.isAdmin = true;
        await user.save();
        
        console.log(`✅ User '${username}' is now an admin!`);
        console.log(`You can now access the admin dashboard at: http://localhost:3000/admin.html`);
        
    } catch (err) {
        console.error('Error setting admin:', err);
    } finally {
        mongoose.connection.close();
    }
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
