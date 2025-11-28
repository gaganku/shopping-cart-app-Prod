const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart', {useNewUrlParser: true, useUnifiedTopology: true});
    const user = await User.findOne({ username: 'admin' });
    if (user) {
      console.log('User found:', JSON.stringify(user.toJSON(), null, 2));
    } else {
      console.log('User "admin" not found.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
