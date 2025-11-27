require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const xlsx = require('xlsx');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.'))); // Serve static files from current dir

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => console.error('MongoDB connection error:', err));

// Nodemailer Transporter (Ethereal for testing)
let transporter;
nodemailer.createTestAccount().then(account => {
    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });
    console.log('Ethereal Email configured');
}).catch(err => console.error('Failed to create test account:', err));

// Routes
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');


// Passport Google OAuth Strategy
console.log('Configuring Google OAuth Strategy...');
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');

try {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('Google OAuth callback received for user:', profile.id);
            // Check if user already exists
            let user = await User.findOne({ googleId: profile.id });
            
            if (user) {
                console.log('Existing user found:', user.username);
                return done(null, user);
            }
            
            // User not found - do NOT create new user
            console.log('User not found for Google ID:', profile.id);
            return done(null, false, { message: 'User not registered', profile: profile });
            
        } catch (err) {
            console.error('Error in Google OAuth callback:', err);
            done(err, null);
        }
    }));
    console.log('Google OAuth Strategy configured successfully');
} catch (err) {
    console.error('Error configuring Google OAuth Strategy:', err);
}

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Seed Products (if empty)
const initialProducts = [
    {
        id: 1,
        name: "Premium Wireless Headphones",
        description: "High-fidelity sound with active noise cancellation and 30-hour battery life.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
        price: 299.99,
        stock: 10
    },
    {
        id: 2,
        name: "Ergonomic Mechanical Keyboard",
        description: "Customizable RGB backlighting with tactile switches for ultimate typing comfort.",
        image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&q=80",
        price: 159.99,
        stock: 5
    },
    {
        id: 3,
        name: "Smart Fitness Watch",
        description: "Track your health metrics, sleep, and workouts with this waterproof smart device.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
        price: 199.99,
        stock: 8
    },
    {
        id: 4,
        name: "4K Ultra HD Monitor",
        description: "Crystal clear display with 144Hz refresh rate, perfect for gaming and professional work.",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
        price: 449.99,
        stock: 3
    }
];

async function seedProducts() {
    const count = await Product.countDocuments();
    if (count === 0) {
        await Product.insertMany(initialProducts);
        console.log('Products seeded');
    }
}
seedProducts();

// Google OAuth Routes
console.log('Registering Google OAuth routes...');
app.get('/auth/google',
    (req, res, next) => {
        console.log('Google OAuth route hit!');
        next();
    },
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    (req, res, next) => {
        passport.authenticate('google', (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                // If user not found, check if we have profile info to complete signup
                if (info && info.profile) {
                    req.session.googleProfile = info.profile;
                    return res.redirect('/complete-profile.html');
                }
                // Fallback to error if no profile info (shouldn't happen with updated strategy)
                return res.redirect('/login.html?error=not_registered');
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                console.log('OAuth callback successful!');
                return res.redirect('/index.html');
            });
        })(req, res, next);
    }
);

// Check authentication status
app.get('/api/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ 
            authenticated: true, 
            user: {
                username: req.user.username,
                displayName: req.user.displayName,
                email: req.user.email,
                isAdmin: req.user.isAdmin || false,
                isAdminVerified: req.user.isAdminVerified || false
            }
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Delete User Endpoint
app.delete('/api/user', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const userId = req.user.id;
        const username = req.user.username;

        // Find and delete user's orders, restore product stock
        const userOrders = await Order.find({ username });
        
        for (const order of userOrders) {
            // Restore product stock
            const product = await Product.findOne({ id: order.productId });
            if (product) {
                product.stock++;
                await product.save();
            }
        }

        // Delete all user's orders
        await Order.deleteMany({ username });

        // Delete user
        await User.findByIdAndDelete(userId);

        req.logout((err) => {
            if (err) {
                return res.status(500).json({ error: 'Logout failed after deletion' });
            }
            res.json({ message: 'Account deleted successfully' });
        });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Auth Endpoints
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const verificationToken = crypto.randomUUID();

        const user = new User({ 
            username, 
            email, 
            password,
            verificationToken,
            isVerified: false
        });
        await user.save();

        // Send verification email
        const verificationLink = `http://localhost:3000/api/verify?token=${verificationToken}`;
        
        const info = await transporter.sendMail({
            from: '"ModernShop" <noreply@modernshop.com>',
            to: email,
            subject: 'Verify your account',
            html: `<p>Please click the link below to verify your account:</p><a href="${verificationLink}">${verificationLink}</a>`
        });

        const etherealUrl = nodemailer.getTestMessageUrl(info);
        console.log('Verification email sent: %s', etherealUrl);
        
        // Auto-open the Ethereal email in browser
        if (etherealUrl) {
            const { exec } = require('child_process');
            exec(`start ${etherealUrl}`);
        }

        res.status(201).json({ message: 'User created. Please verify your email.' });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(400).json({ error: 'Error creating user' });
    }
});

// Verification Endpoint
app.get('/api/verify', async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).send('Invalid verification token');
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.redirect('/login.html?verified=true');
    } catch (err) {
        console.error('Verification error:', err);
        res.status(500).send('Server error');
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if user exists first
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check verification status (skip for Google users who might not have password)
        if (user.password && !user.isVerified) {
            return res.status(401).json({ error: 'Please verify your email before logging in' });
        }

        // Check password (simple string comparison for now as per existing code)
        if (user.password === password) {
            // Establish Passport session
            req.login(user, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Session creation failed' });
                }
                res.json({ message: 'Login successful', username: user.username });
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Product Endpoints
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Purchase Endpoint
app.post('/api/purchase', async (req, res) => {
    try {
        const { username, productId } = req.body;
        
        // Check global limit
        const existingOrder = await Order.findOne({ username });
        if (existingOrder) {
            return res.status(400).json({ error: 'You can only buy one item in total!' });
        }

        // Check if user is verified by admin (skip for admins)
        const user = await User.findOne({ username });
        if (!user.isAdmin && !user.isAdminVerified) {
             return res.status(403).json({ error: 'Account pending admin verification. Please contact support.' });
        }

        const product = await Product.findOne({ id: productId });
        if (!product || product.stock <= 0) {
            return res.status(400).json({ error: 'Product unavailable' });
        }

        // Create order and update stock
        const order = new Order({ 
            username, 
            productId, 
            productName: product.name 
        });
        await order.save();

        product.stock--;
        await product.save();

        res.json({ message: 'Purchase successful', productName: product.name });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's order (cart)
app.get('/api/orders/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const order = await Order.findOne({ username });
        
        if (order) {
            res.json({ order });
        } else {
            res.json({ order: null });
        }
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete order (remove from cart)
app.delete('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Restore product stock
        const product = await Product.findOne({ id: order.productId });
        if (product) {
            product.stock++;
            await product.save();
        }

        // Delete order
        await Order.findByIdAndDelete(orderId);

        res.json({ message: 'Order cancelled successfully' });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Report Endpoint
app.get('/api/report', async (req, res) => {
    try {
        const orders = await Order.find();
        // Format: "Product Name,Buyer Name"
        let csv = "Product Name,Buyer Name\n";
        orders.forEach(order => {
            csv += `"${order.productName}","${order.username}"\n`;
        });
        res.send(csv);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Database Viewer Endpoints
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude passwords for security
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/google/complete', async (req, res) => {
    try {
        if (!req.session.googleProfile) {
            return res.status(400).json({ error: 'No Google profile found in session' });
        }

        const { username } = req.body;
        const profile = req.session.googleProfile;

        // Check if username exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Create new user
        const user = new User({
            googleId: profile.id,
            username: username,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
            displayName: username // Use custom username as display name
        });

        await user.save();
        console.log('New Google user created with custom username:', user.username);

        // Log user in
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Login failed after signup' });
            }
            // Clear session profile
            delete req.session.googleProfile;
            res.json({ message: 'Signup successful', username: user.username });
        });

    } catch (err) {
        console.error('Error in complete profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin Middleware
function isAdmin(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// Multer configuration for file uploads
const upload = multer({ dest: 'uploads/' });

// Helper function to generate username from email
function generateUsername(email) {
    const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return baseUsername;
}

// Helper function to generate random password
function generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Admin: Bulk User Upload with Progress
app.post('/api/admin/bulk-upload', isAdmin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const results = {
            success: [],
            failed: []
        };

        const totalUsers = data.length;
        let processedUsers = 0;

        // Set headers for streaming response
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Total-Users', totalUsers);

        for (const row of data) {
            try {
                const email = row.email || row.Email;
                if (!email) {
                    results.failed.push({ email: 'N/A', reason: 'No email provided' });
                    processedUsers++;
                    continue;
                }

                // Check if user already exists
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    results.failed.push({ email, reason: 'User already exists' });
                    processedUsers++;
                    continue;
                }

                // Generate username and password
                let username = generateUsername(email);
                
                // Ensure username is unique
                let counter = 1;
                while (await User.findOne({ username })) {
                    username = `${generateUsername(email)}${counter}`;
                    counter++;
                }

                const password = generatePassword();

                // Create user
                const user = new User({
                    username,
                    email,
                    password,
                    isVerified: true, // Auto-verify bulk users (email)
                    isAdminVerified: true, // Auto-verify by admin
                    mustChangePassword: true
                });

                await user.save();

                // Send welcome email with credentials
                const welcomeEmail = await transporter.sendMail({
                    from: '"ModernShop" <noreply@modernshop.com>',
                    to: email,
                    subject: 'Welcome to ModernShop - Your Account Details',
                    html: `
                        <h2>Welcome to ModernShop!</h2>
                        <p>Your account has been created by an administrator.</p>
                        <p><strong>Login Details:</strong></p>
                        <ul>
                            <li>Username: <strong>${username}</strong></li>
                            <li>Temporary Password: <strong>${password}</strong></li>
                        </ul>
                        <p>Please login at: <a href="http://localhost:3000/login.html">http://localhost:3000/login.html</a></p>
                        <p><strong>Important:</strong> You will be required to change your password on first login.</p>
                    `
                });

                const etherealUrl = nodemailer.getTestMessageUrl(welcomeEmail);
                console.log(`Welcome email sent to ${email}: ${etherealUrl}`);

                results.success.push({ email, username });
                processedUsers++;

            } catch (err) {
                results.failed.push({ email: row.email || 'N/A', reason: err.message });
                processedUsers++;
            }
        }

        // Delete uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            message: 'Bulk upload completed',
            results
        });
    } catch (err) {
        console.error('Bulk upload error:', err);
        res.status(500).json({ error: 'Server error during bulk upload' });
    }
});

// Admin: Get all users
app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '-password -verificationToken');
        res.json({ users });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Verify User
app.post('/api/admin/verify-user', isAdmin, async (req, res) => {
    try {
        const { userId, verify } = req.body; // verify is boolean
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isAdminVerified = verify;
        if (verify) {
            user.isVerified = true; // Auto-verify email/account if admin approves
        } else {
            user.isVerified = false; // Revoke email verification if admin revokes
        }
        await user.save();

        res.json({ message: `User ${verify ? 'verified' : 'unverified'} successfully`, isAdminVerified: user.isAdminVerified });
    } catch (err) {
        console.error('Error verifying user:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Bulk delete users
app.post('/api/admin/users/bulk-delete', isAdmin, async (req, res) => {
    try {
        const { userIds } = req.body;
        
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'No user IDs provided' });
        }

        // Prevent deleting the main admin account
        const adminUser = await User.findOne({ username: 'admin' });
        const filteredIds = userIds.filter(id => id !== adminUser._id.toString());

        // Get usernames for the users to be deleted
        const usersToDelete = await User.find({ _id: { $in: filteredIds } });
        const usernamesToDelete = usersToDelete.map(user => user.username);

        // Find and delete orders for these users, restore product stock
        const ordersToDelete = await Order.find({ username: { $in: usernamesToDelete } });
        
        for (const order of ordersToDelete) {
            // Restore product stock
            const product = await Product.findOne({ id: order.productId });
            if (product) {
                product.stock++;
                await product.save();
            }
        }

        // Delete all orders for these users
        await Order.deleteMany({ username: { $in: usernamesToDelete } });

        // Delete users
        const result = await User.deleteMany({ _id: { $in: filteredIds } });

        res.json({ 
            message: 'Users deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (err) {
        console.error('Error deleting users:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
