require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    
    // Find admin_test order
    const order = await Order.findOne({ username: 'admin_test' });
    
    if (order) {
        console.log(`Found order: ${order._id}`);
        order.status = 'confirmed';
        order.purchaseDate = new Date();
        await order.save();
        console.log('Order updated with status and purchaseDate');
    } else {
        console.log('Order not found for admin_test');
    }

    mongoose.connection.close();
}).catch(err => console.error(err));
