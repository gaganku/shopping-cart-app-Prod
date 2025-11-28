const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Keeping numeric ID for compatibility
    name: { type: String, required: true },
    description: { type: String, required: false },
    image: { type: String, required: false },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0, required: true }
});

module.exports = mongoose.model('Product', ProductSchema);
