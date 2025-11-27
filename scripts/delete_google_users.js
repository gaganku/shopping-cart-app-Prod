const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    const result = await User.deleteMany({ googleId: { $exists: true } });
    console.log(`Deleted ${result.deletedCount} Google users.`);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
