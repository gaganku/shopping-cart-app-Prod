require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    
    // Find all orders
    const orders = await Order.find({});
    console.log(`Total Orders: ${orders.length}`);
    
    orders.forEach(order => {
        console.log(`Order ID: ${order._id}`);
        console.log(`Username: ${order.username}`);
        console.log(`Product ID: ${order.productId}`);
        console.log(`Status: ${order.status}`);
        console.log(`Date: ${order.purchaseDate || order.createdAt}`);
        console.log('-------------------');
    });

    // Check specifically for admin_test
    const adminOrders = await Order.find({ username: 'admin_test' });
    console.log(`\nOrders for 'admin_test': ${adminOrders.length}`);

    mongoose.connection.close();
}).catch(err => console.error(err));
