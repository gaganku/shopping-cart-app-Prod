require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    const users = await User.find();
    console.log(`\n📊 Total users in database: ${users.length}\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email}) - Admin: ${user.isAdmin ? 'YES' : 'NO'}`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
