const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart')
    .then(async () => {
        console.log('Connected to DB');
        const users = await User.find({});
        console.log('Users:', users);
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
