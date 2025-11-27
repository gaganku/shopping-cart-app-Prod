const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    const users = await User.find({});
    console.log('Users:', JSON.stringify(users, null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
