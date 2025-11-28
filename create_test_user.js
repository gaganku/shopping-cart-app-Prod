const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart', {useNewUrlParser: true, useUnifiedTopology: true});
    const existing = await User.findOne({username: 'testuser'});
    if (existing) {
      console.log('User already exists, deleting...');
      await User.deleteOne({_id: existing._id});
    }
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test1234', // plain for now (no hashing in this demo)
      isVerified: true,
      phoneNumber: ''
    });
    await user.save();
    console.log('User created');
    process.exit(0);
  } catch (err) {
    console.error('Error creating user', err);
    process.exit(1);
  }
})();
