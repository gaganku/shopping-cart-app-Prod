const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    username: { type: String, required: true },
    productId: { type: Number, required: true },
    productName: String,
    status: { type: String, default: 'pending' }, // pending, confirmed, shipped
    purchaseDate: { type: Date },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
