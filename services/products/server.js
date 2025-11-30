require('dotenv').config({ path: '../../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Models
const Product = require('../../src/models/Product');

// Config
const connectDB = require('../../src/config/database');

const app = express();
const PORT = 3002;

// Middleware
app.set('trust proxy', 1);
app.use(cors({
    origin: process.env.BASE_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());

// Database
connectDB();

// Routes
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Seed Products (Simplified)
const seedProducts = async () => {
    const count = await Product.countDocuments();
    if (count === 0) {
        const initialProducts = [
            {
                id: 1,
                name: "Premium Wireless Headphones",
                description: "High-fidelity sound with active noise cancellation.",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
                price: 299.99,
                stock: 10
            },
            {
                id: 2,
                name: "Smart Fitness Watch",
                description: "Track your health metrics with precision.",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
                price: 199.99,
                stock: 15
            },
            {
                id: 3,
                name: "Portable Bluetooth Speaker",
                description: "360-degree sound in a compact design.",
                image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80",
                price: 79.99,
                stock: 20
            },
            {
                id: 4,
                name: "4K Action Camera",
                description: "Capture your adventures in stunning detail.",
                image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80",
                price: 349.99,
                stock: 5
            },
            {
                id: 5,
                name: "Mechanical Gaming Keyboard",
                description: "RGB backlighting with tactile switches.",
                image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&q=80",
                price: 129.99,
                stock: 8
            }
        ];
        await Product.insertMany(initialProducts);
        console.log('Products seeded');
    }
};
seedProducts();

app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
});
