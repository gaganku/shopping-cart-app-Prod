const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Keeping numeric ID for compatibility
    name: { type: String, required: true },
    description: String,
    image: String,
    price: Number,
    stock: { type: Number, default: 0 }
});

module.exports = mongoose.model('Product', ProductSchema);
