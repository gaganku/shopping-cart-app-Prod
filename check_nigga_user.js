require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    const user = await User.findOne({ username: 'nigga' });
    if (user) {
        console.log('User found:', user);
    } else {
        console.log('User "nigga" not found');
    }
    mongoose.connection.close();
}).catch(err => console.error(err));
