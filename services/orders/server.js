require('dotenv').config({ path: '../../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const xlsx = require('xlsx');

// Models
const Order = require('../../src/models/Order');
const Product = require('../../src/models/Product');
const User = require('../../src/models/User');

// Config
const connectDB = require('../../src/config/database');

// Email Service
const { sendOrderConfirmationEmail } = require('../../src/utils/emailService');

const app = express();
const PORT = 3003;

// Middleware
app.set('trust proxy', 1);
app.use(cors({
    origin: process.env.BASE_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());

// Database
connectDB();

// Session (Must match Auth Service for shared sessions)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart',
        ttl: 24 * 60 * 60,
        autoRemove: 'native'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Note: We don't need Passport here, just session checking

// Middleware to check auth
const isAuthenticated = (req, res, next) => {
    // Check if user session exists (set by Auth Service)
    if (req.session && req.session.passport && req.session.passport.user) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
};

const isAdmin = async (req, res, next) => {
    if (req.session && req.session.passport && req.session.passport.user) {
        const user = await User.findById(req.session.passport.user);
        if (user && user.isAdmin) {
            return next();
        }
    }
    res.status(403).json({ error: 'Admin access required' });
};

// Routes

// Purchase
app.post('/api/purchase', isAuthenticated, async (req, res) => {
    try {
        const { productId } = req.body;
        
        // Get user from session
        const user = await User.findById(req.session.passport.user);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!user.isVerified) {
            return res.status(403).json({ error: 'Please verify your email/phone before purchasing.' });
        }

        const product = await Product.findOne({ id: productId });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        if (product.stock <= 0) return res.status(400).json({ error: 'Out of stock' });

        // Check if user already bought this (Limit 1)
        const existingOrder = await Order.findOne({ 
            userId: user._id, 
            'productId': product._id,
            status: { $ne: 'cancelled' }
        });

        if (existingOrder) {
            return res.status(400).json({ error: 'You can only buy one item of each type.' });
        }

        // Create Order
        const order = new Order({
            userId: user._id,
            productId: product._id,
            amount: product.price,
            status: 'pending',
            date: new Date()
        });

        // Decrement Stock
        product.stock -= 1;
        await product.save();
        await order.save();

        // Send Email
        if (user.email) {
            try {
                await sendOrderConfirmationEmail(user.email, order, product);
            } catch (e) { console.error(e); }
        }

        res.json({ message: 'Purchase successful', productName: product.name });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// User Orders
app.get('/api/user/orders', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.passport.user);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const orders = await Order.find({ userId: user._id })
            .populate('productId')
            .sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: All Orders
app.get('/api/orders', isAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'username email')
            .populate('productId', 'name price');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Report
app.get('/api/report', isAdmin, async (req, res) => {
    try {
        const orders = await Order.find().populate('userId').populate('productId');
        
        const data = orders.map(order => ({
            OrderID: order._id.toString(),
            Username: order.userId ? order.userId.username : 'Unknown',
            Email: order.userId ? order.userId.email : 'Unknown',
            Product: order.productId ? order.productId.name : 'Unknown',
            Price: order.amount,
            Date: order.date,
            Status: order.status
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Orders");
        
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'csv' });
        
        res.setHeader('Content-Disposition', 'attachment; filename="orders_report.csv"');
        res.setHeader('Content-Type', 'text/csv');
        res.send(buffer);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
});
