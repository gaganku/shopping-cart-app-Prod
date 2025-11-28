require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const TARGET_USERNAME = 'halo29872486'; // The user we want to test
const DAYS_AGO = 15;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ username: TARGET_USERNAME });
    if (!user) {
        console.log(`User ${TARGET_USERNAME} not found!`);
    } else {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - DAYS_AGO);
        
        user.lastLogin = oldDate;
        await user.save();
        console.log(`Updated ${TARGET_USERNAME} lastLogin to: ${user.lastLogin}`);
        console.log('This should trigger 2FA on next login.');
    }
    
    mongoose.connection.close();
}).catch(err => console.error(err));
