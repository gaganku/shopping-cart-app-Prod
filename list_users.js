require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    const users = await User.find({}, 'username email lastLogin googleId');
    console.log('All Users:');
    users.forEach(u => {
        console.log(`- Username: ${u.username}, Email: ${u.email}, LastLogin: ${u.lastLogin}, GoogleID: ${u.googleId}`);
    });
    mongoose.connection.close();
}).catch(err => console.error(err));
