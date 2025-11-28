const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    username: { type: String, required: true },
    productId: { type: Number, required: true },
    productName: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
