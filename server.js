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

const MongoStore = require('connect-mongo');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (Required for Vercel/Render/Heroku)
app.set('trust proxy', 1);

// CORS Configuration
app.use(cors({
    origin: process.env.BASE_URL || 'https://shopping-cart-prod.vercel.app',
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public dir

// Database Connection
const connectDB = require('./src/config/database');
connectDB();

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        // Reuse the existing mongoose connection logic
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart',
        ttl: 24 * 60 * 60, // 1 day
        autoRemove: 'native' 
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport (CRITICAL: Must be after session)
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport Strategy
const configurePassport = require('./src/config/passport');
configurePassport();

// Email Configuration
const { initializeEmailTransporter, getTransporter } = require('./src/config/email');
let transporter;
initializeEmailTransporter().then(t => { transporter = t; });

// Email Service
const { 
    sendVerificationEmail, 
    sendWelcomeEmail, 
    sendOTPEmail,
    sendOrderConfirmationEmail,
    sendCredentialsEmail 
} = require('./src/utils/emailService');



// Routes
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

// Multer configuration for file uploads
const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp' : 'uploads/';
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: uploadDir });

// Middleware
const { isAdmin, isAuthenticated } = require('./src/middleware/auth');

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
mongoose.connection.once('open', () => {
    seedProducts();
});

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
        passport.authenticate('google', async (err, user, info) => {
            if (err) { return next(err); }
            
            // Get profile from user (if exists) or info (if new)
            // Note: user is false if not found in DB (from strategy)
            const profile = user ? { ...user.toObject(), existingUser: true } : info.profile;
            
            console.log('Debug - User found:', !!user);
            console.log('Debug - Profile keys:', Object.keys(profile));
            if (profile.emails) console.log('Debug - Profile emails:', profile.emails);
            if (user) console.log('Debug - User email from DB:', user.email);

            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : (user ? user.email : null);

            if (!email) {
                console.error('Debug - No email found for user/profile');
                return res.redirect('/login.html?error=no_email');
            }

            // Check if existing user and if they need OTP (10-day check)
            if (user) {
                const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
                
                // If user logged in within 10 days, skip OTP
                // TEMPORARILY DISABLED FOR TESTING
                /*
                if (user.lastLogin && user.lastLogin >= tenDaysAgo) {
                    console.log('User logged in recently, skipping OTP');
                    user.lastLogin = new Date();
                    await user.save();
                    
                    return req.login(user, (loginErr) => {
                        if (loginErr) {
                            console.error('Login error:', loginErr);
                            return res.redirect('/login.html?error=login_failed');
                        }
                        res.redirect('/index.html');
                    });
                }
                */
            }

            // Generate OTP (for new users or users who haven't logged in for 10+ days)
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Store minimal profile data to avoid serialization issues
            const cleanProfile = profile ? {
                id: profile.id,
                displayName: profile.displayName,
                emails: profile.emails,
                photos: profile.photos
            } : null;

            // Store in session
            req.session.googleAuth = {
                profile: cleanProfile,
                otp: otp,
                otpExpires: Date.now() + 10 * 60 * 1000, // 10 mins
                isExistingUser: !!user,
                userId: user ? user._id : null
            };

            // Send OTP Email using enhanced email service
            let emailResult = { success: false, fallbackOtp: otp };
            
            try {
                emailResult = await sendOTPEmail(email, otp, 'google-login');
                console.log('[Google OAuth] Email send result:', emailResult);
            } catch (emailErr) {
                console.error('Error sending Google OTP:', emailErr);
            }

            // Store email result in session for frontend display
            req.session.googleAuth.emailSuccess = emailResult.success;
            if (!emailResult.success) {
                req.session.googleAuth.fallbackOtp = emailResult.fallbackOtp;
            }

            let redirectUrl = '/google-otp.html';
            const params = new URLSearchParams();
            
            if (emailResult.etherealUrl) {
                params.append('preview', emailResult.etherealUrl);
            }
            
            if (!emailResult.success) {
                params.append('emailFailed', 'true');
                console.log('[Google OAuth] Email failed - fallback OTP stored in session');
            }
            
            if (params.toString()) {
                redirectUrl += `?${params.toString()}`;
            }
            
            // Explicitly save session before redirect
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.redirect('/login.html?error=session_error');
                }
                res.redirect(redirectUrl);
            });
        })(req, res, next);
    }
);

// Google Auth: Verify OTP
app.post('/api/auth/google/verify-otp', async (req, res) => {
    try {
        const { otp } = req.body;
        const sessionData = req.session.googleAuth;

        if (!sessionData || !sessionData.otp) {
            return res.status(400).json({ error: 'Session expired or invalid' });
        }

        if (Date.now() > sessionData.otpExpires) {
            return res.status(400).json({ error: 'OTP expired' });
        }

        if (sessionData.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // OTP Valid
        if (sessionData.isExistingUser) {
            // Log in existing user
            const user = await User.findById(sessionData.userId);
            if (!user) return res.status(404).json({ error: 'User not found' });

            user.lastLogin = new Date();
            await user.save();

            req.login(user, (err) => {
                if (err) return res.status(500).json({ error: 'Login failed' });
                delete req.session.googleAuth; // Clear session data
                req.session.save((saveErr) => {
                    if (saveErr) console.error('Session save error:', saveErr);
                    res.json({ message: 'Login successful' });
                });
            });
        } else {
            // New user - allow to proceed to completion
            // Don't clear session yet, we need profile data for completion
            sessionData.otpVerified = true;
            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error('Session save error:', saveErr);
                    return res.status(500).json({ error: 'Session save failed' });
                }
                res.json({ message: 'OTP verified', redirect: '/google-complete.html' });
            });
        }
    } catch (err) {
        console.error('Google OTP Verify Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Google Auth: Get Session Info (for fallback OTP display)
app.get('/api/auth/google/session-info', (req, res) => {
    const sessionData = req.session.googleAuth;
    
    if (!sessionData) {
        return res.status(400).json({ error: 'No active session' });
    }
    
    const response = {
        hasSession: true,
        emailSuccess: sessionData.emailSuccess || false
    };
    
    // Only send fallback OTP if email failed
    if (!sessionData.emailSuccess && sessionData.fallbackOtp) {
        response.fallbackOtp = sessionData.fallbackOtp;
    }
    
    res.json(response);
});

// Google Auth: Complete Profile
app.post('/api/auth/google/complete', async (req, res) => {
    try {
        const { username, phone } = req.body;
        const sessionData = req.session.googleAuth;

        if (!sessionData || !sessionData.otpVerified) {
            return res.status(403).json({ error: 'Unauthorized - Session expired or OTP not verified' });
        }

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        // Check if username taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        console.log('[Google Complete] Session Data Keys:', Object.keys(sessionData));
        const profile = sessionData.profile;
        if (!profile) {
            console.error('[Google Complete] Profile missing. Session data:', JSON.stringify(sessionData, null, 2));
            return res.status(400).json({ error: 'Profile data missing from session' });
        }

        const email = (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : null;
        if (!email) {
            return res.status(400).json({ error: 'No email found in Google profile' });
        }

        const newUser = new User({
            username,
            email,
            googleId: profile.id,
            displayName: profile.displayName,
            phoneNumber: phone,
            isVerified: false, // Require admin approval or email verification
            lastLogin: new Date()
        });

        await newUser.save();

        // Send Welcome Email
        if (transporter) {
            try {
                const welcomeEmail = await transporter.sendMail({
                    from: '"ModernShop" <noreply@modernshop.com>',
                    to: email,
                    subject: 'Welcome to ModernShop! 🎉',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px;">
                            <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                                <h1 style="color: #667eea; margin: 0 0 20px 0; font-size: 28px;">Welcome, ${username}! 🚀</h1>
                                <p style="font-size: 16px; color: #333; line-height: 1.6;">Your account has been successfully created.</p>
                                <p style="font-size: 16px; color: #333; line-height: 1.6;">You can browse products, but verification is required to make purchases.</p>
                            </div>
                        </div>
                    `
                });
                const etherealUrl = nodemailer.getTestMessageUrl(welcomeEmail);
                if (etherealUrl) {
                    console.log('Welcome email sent: %s', etherealUrl);
                }
            } catch (emailErr) {
                console.error('Error sending welcome email:', emailErr);
            }
        }

        // Login user (they can browse but not purchase until verified)
        req.login(newUser, (err) => {
            if (err) return res.status(500).json({ error: 'Login failed: ' + err.message });
            delete req.session.googleAuth;
            res.json({ message: 'Account created and logged in' });
        });

    } catch (err) {
        console.error('Google Complete Error:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

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
app.post('/api/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
            }
            res.clearCookie('connect.sid');
            res.json({ message: 'Logged out successfully' });
        });
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
        const { username, email, password, phoneNumber } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password, // Note: In production, hash this password!
            phoneNumber,
            isVerified: false, // User needs to verify OTP
            createdAt: new Date()
        });

        // Generate OTP for initial verification
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        newUser.otpCode = otp;
        newUser.otpExpires = otpExpires;
        
        await newUser.save();
        console.log(`User created: ${username} (${email})`);

        // Send OTP Email
        let emailResult = { success: false, fallbackOtp: otp };
        if (email && transporter) {
            try {
                emailResult = await sendOTPEmail(email, otp, 'signup');
                console.log('[Signup] Email send result:', emailResult);
            } catch (emailErr) {
                console.error('Error sending signup OTP:', emailErr);
            }
        }

        // Store session data for OTP verification page
        req.session.googleAuth = {
            userId: newUser._id,
            otp: otp,
            otpExpires: otpExpires.getTime(),
            isExistingUser: false,
            emailSuccess: emailResult.success,
            fallbackOtp: emailResult.success ? null : otp
        };

        // Return success with 2FA requirement
        res.status(201).json({ 
            message: 'User created. Please verify OTP.',
            require2FA: true,
            userId: newUser._id,
            emailSuccess: emailResult.success
        });

    } catch (err) {
        console.error('Signup error:', err);
        res.status(400).json({ error: err.message || 'Error creating user' });
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
        user.lastLogin = new Date();
        await user.save();

        // Send Welcome Email
        if (user.email && transporter) {
            try {
                const welcomeEmail = await transporter.sendMail({
                    from: '"ModernShop" <noreply@modernshop.com>',
                    to: user.email,
                    subject: 'Welcome to ModernShop! 🎉',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px;">
                            <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                                <h1 style="color: #667eea; margin: 0 0 20px 0; font-size: 28px;">Welcome to ModernShop! 🚀</h1>
                                <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${user.username},</p>
                                <p style="font-size: 16px; color: #333; line-height: 1.6;">Your account has been successfully verified. We're thrilled to have you on board!</p>
                                <p style="font-size: 16px; color: #333; line-height: 1.6;">You can now login and start shopping for the best tech gadgets.</p>
                                <div style="text-align: center; margin-top: 30px;">
                                    <a href="https://shopping-cart-app-prod-3.onrender.com/login.html" style="background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Login Now</a>
                                </div>
                            </div>
                        </div>
                    `
                });
                const etherealUrl = nodemailer.getTestMessageUrl(welcomeEmail);
                if (etherealUrl) console.log('Welcome email sent: %s', etherealUrl);
            } catch (emailErr) {
                console.error('Error sending welcome email:', emailErr);
            }
        }

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

        // Check password (simple string comparison for now as per existing code)
        // In a real app, use bcrypt.compare(password, user.password)
        if (user.password === password) {
            
            // Check last login date for 2FA
            const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
            
            if (!user.lastLogin || user.lastLogin < tenDaysAgo) {
                // Require 2FA
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

                user.otpCode = otp;
                user.otpExpires = otpExpires;
                await user.save();

                let emailResult = { success: false, fallbackOtp: otp };
                
                // Try sending email if user has email
                if (user.email) {
                    emailResult = await sendOTPEmail(user.email, otp, 'login');
                    console.log('[Login] Email send result:', emailResult);
                }

                // Prepare response
                const response = { 
                    require2FA: true, 
                    userId: user._id
                };

                if (emailResult.success) {
                    // Email sent successfully
                    response.message = 'It has been a while! We sent a verification code to your email.';
                    if (emailResult.etherealUrl) {
                        response.previewUrl = emailResult.etherealUrl;
                    }
                } else {
                    // Email failed - show OTP in UI
                    response.message = '⚠️ Email service unavailable. Please use the code below:';
                    response.fallbackOtp = emailResult.fallbackOtp;
                    console.log('[Login] Using fallback OTP display');
                }

                return res.json(response);
            }

            // No 2FA needed - Login
            user.lastLogin = new Date();
            await user.save();

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
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify 2FA Endpoint
app.post('/api/auth/verify-2fa', async (req, res) => {
    try {
        const { userId, otp } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.otpCode || !user.otpExpires) {
            return res.status(400).json({ error: 'No OTP requested' });
        }

        if (Date.now() > user.otpExpires) {
            return res.status(400).json({ error: 'OTP expired' });
        }

        if (user.otpCode !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // OTP Valid - Login User
        user.otpCode = undefined;
        user.otpExpires = undefined;
        user.lastLogin = new Date(); // Update last login
        await user.save();

        req.login(user, (err) => {
            if (err) return res.status(500).json({ error: 'Login failed' });
            res.json({ message: 'Login successful', username: user.username });
        });
    } catch (err) {
        console.error('2FA verify error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// OTP Login: Request OTP
app.post('/api/auth/otp/request', async (req, res) => {
    try {
        const { email } = req.body; // User enters email (or username)
        
        // Find user by email or username
        const user = await User.findOne({ $or: [{ email }, { username: email }] });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otpCode = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP via Email
        let etherealUrl = null;
        if (transporter && user.email) {
            const info = await transporter.sendMail({
                from: '"ModernShop" <noreply@modernshop.com>',
                to: user.email,
                subject: 'Your Login OTP',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Login OTP</h2>
                        <p>Your One-Time Password (OTP) for login is:</p>
                        <h1 style="color: #667eea; letter-spacing: 5px;">${otp}</h1>
                        <p>This code expires in 10 minutes.</p>
                    </div>
                `
            });
            etherealUrl = nodemailer.getTestMessageUrl(info);
            if (etherealUrl) {
                console.log('OTP email sent: %s', etherealUrl);
                // Auto-open for dev convenience
                if (process.env.NODE_ENV !== 'production' && process.platform === 'win32') {
                     const { exec } = require('child_process');
                     exec(`start ${etherealUrl}`);
                }
            }
        }

        res.json({ message: 'OTP sent successfully', previewUrl: etherealUrl });
    } catch (err) {
        console.error('OTP request error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// OTP Login: Verify OTP
app.post('/api/auth/otp/verify', async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        const user = await User.findOne({ $or: [{ email }, { username: email }] });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.otpCode || !user.otpExpires) {
            return res.status(400).json({ error: 'No OTP requested' });
        }

        if (Date.now() > user.otpExpires) {
            return res.status(400).json({ error: 'OTP expired' });
        }

        if (user.otpCode !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // OTP Valid - Login User
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();

        req.login(user, (err) => {
            if (err) return res.status(500).json({ error: 'Login failed' });
            res.json({ message: 'Login successful', username: user.username, isAdmin: user.isAdmin });
        });
    } catch (err) {
        console.error('OTP verify error:', err);
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

// Serve uploaded files
// Serve uploaded files
if (process.env.NODE_ENV === 'production') {
    app.use('/uploads', express.static('/tmp'));
} else {
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// Admin: Create new product
app.post('/api/admin/products', isAdmin, upload.single('imageFile'), async (req, res) => {
    try {
        console.log('Received product creation request:', req.body);
        console.log('File:', req.file);
        
        const { name, price, description, imageUrl, stock } = req.body;
        
        let finalImage = '';
        if (req.file) {
            // If file uploaded, use the file path
            // Normalize path to be URL-friendly (forward slashes)
            finalImage = '/uploads/' + req.file.filename;
        } else if (imageUrl) {
            // If URL provided, use it
            finalImage = imageUrl;
        } else {
            // Default image or error
            finalImage = 'https://via.placeholder.com/500?text=No+Image';
        }

        // Generate unique product ID
        const products = await Product.find();
        const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
        const newId = maxId + 1;

        const product = new Product({
            id: newId,
            name,
            price: parseFloat(price),  // Ensure it's a number
            description,
            image: finalImage,
            stock: parseInt(stock) || 0  // Ensure it's a number
        });

        console.log('Attempting to save product:', product);
        await product.save();
        console.log('Product saved successfully:', product);
        res.json({ message: 'Product created successfully', product });
    } catch (err) {
        console.error('Error creating product:', err);
        console.error('Error stack:', err.stack);
        console.error('Error message:', err.message);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Admin: Update product stock
app.patch('/api/admin/products/:productId/stock', isAdmin, async (req, res) => {
    try {
        const { productId } = req.params;
        const { stock } = req.body;

        const product = await Product.findOne({ id: parseInt(productId) });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        product.stock = parseInt(stock);
        await product.save();

        res.json({ message: 'Stock updated successfully', product });
    } catch (err) {
        console.error('Error updating stock:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Delete product
app.delete('/api/admin/products/:productId', isAdmin, async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOne({ id: parseInt(productId) });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await Product.deleteOne({ id: parseInt(productId) });
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Purchase Endpoint
app.post('/api/purchase', async (req, res) => {
    try {
        const { username, productId } = req.body;
        
        // Check if user is verified by admin (skip for admins)
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check permissions: Allow if Admin OR Admin-Verified OR Email-Verified
        if (!user.isAdmin && !user.isAdminVerified && !user.isVerified) {
             return res.status(403).json({ error: 'Account pending verification. Please verify your email or contact support.' });
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

        res.json({ message: 'Added to cart successfully', productName: product.name });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Confirm Order and Send Email
app.post('/api/orders/:orderId/confirm', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Get user and product details
        const user = await User.findOne({ username: order.username });
        const product = await Product.findOne({ id: order.productId });

        if (!user || !product) {
            return res.status(404).json({ error: 'User or product not found' });
        }

        // ✅ FIRST: Mark order as confirmed and update status (ALWAYS HAPPENS)
        order.status = 'confirmed';
        order.purchaseDate = new Date();
        await order.save();

        console.log(`✅ Order ${orderId} confirmed and saved to database`);

        // ✅ THEN: Try to send email (OPTIONAL - won't rollback order if it fails)
        let emailSent = false;
        let emailError = null;

        if (user.email && transporter) {
            try {
                const orderDate = new Date(order.purchaseDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const confirmationEmail = await transporter.sendMail({
                    from: '"ModernShop" <noreply@modernshop.com>',
                    to: user.email,
                    subject: `Order Confirmation - ${product.name}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px;">
                            <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                                <h1 style="color: #667eea; margin: 0 0 20px 0; font-size: 28px;">🎉 Order Confirmed!</h1>
                                
                                <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${user.displayName || user.username},</p>
                                
                                <p style="font-size: 16px; color: #333; line-height: 1.6;">Thank you for your purchase! Your order has been confirmed.</p>
                                
                                <div style="background: #f7f7f7; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 8px;">
                                    <h2 style="color: #667eea; margin: 0 0 15px 0; font-size: 20px;">Order Details</h2>
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 10px 0; color: #666; font-weight: 600;">Product:</td>
                                            <td style="padding: 10px 0; color: #333; font-weight: bold;">${product.name}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px 0; color: #666; font-weight: 600;">Price:</td>
                                            <td style="padding: 10px 0; color: #333;">$${product.price.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px 0; color: #666; font-weight: 600;">Order Date:</td>
                                            <td style="padding: 10px 0; color: #333;">${orderDate}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px 0; color: #666; font-weight: 600;">Order ID:</td>
                                            <td style="padding: 10px 0; color: #333; font-family: monospace;">${order._id}</td>
                                        </tr>
                                    </table>
                                </div>
                                
                                <div style="background: #e8f5e9; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin: 20px 0;">
                                    <p style="margin: 0; color: #2e7d32; font-weight: 600;">✓ Your order is being processed</p>
                                </div>
                                
                                <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 30px;">
                                    You can view your order details anytime by visiting your 
                                    <a href="https://shopping-cart-app-prod-3.onrender.com/cart.html" style="color: #667eea; text-decoration: none; font-weight: 600;">cart page</a>.
                                </p>
                                
                                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                                
                                <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
                                    This is an automated email. Please do not reply to this message.
                                </p>
                            </div>
                        </div>
                    `
                });

                // For Ethereal test emails, log the preview URL
                const etherealUrl = nodemailer.getTestMessageUrl(confirmationEmail);
                if (etherealUrl) {
                    console.log(`Test email preview: ${etherealUrl}`);
                    // Only auto-open in local development on Windows
                    if (process.env.NODE_ENV !== 'production' && process.platform === 'win32') {
                        const { exec } = require('child_process');
                        exec(`start ${etherealUrl}`);
                    }
                } else {
                    // Real email sent via Gmail
                    console.log(`Order confirmation email sent to ${user.email}`);
                }

                emailSent = true;
            } catch (emailErr) {
                console.error('⚠️ Failed to send confirmation email (order still confirmed):', emailErr);
                emailError = emailErr.message;
                // Order is still confirmed - don't throw error
            }
        } else {
            console.log('⚠️ No email sent - missing user email or transporter (order still confirmed)');
        }

        // Return success response (order is confirmed regardless of email status)
        res.json({ 
            message: emailSent ? 'Order confirmed and email sent' : 'Order confirmed (email failed)',
            productName: product.name,
            orderStatus: 'confirmed',
            emailSent,
            emailError
        });
    } catch (err) {
        console.error('Error confirming order:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Bulk Confirm Multiple Orders - Send One Combined Email
app.post('/api/orders/confirm-bulk', async (req, res) => {
    try {
        const { orderIds } = req.body;
        
        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ error: 'No order IDs provided' });
        }

        const orders = await Order.find({ _id: { $in: orderIds } });
        if (orders.length === 0) {
            return res.status(404).json({ error: 'No orders found' });
        }

        const username = orders[0].username;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Confirm all orders and collect product details
        const orderDate = new Date();
        const orderDetails = [];
        let totalPrice = 0;

        for (const order of orders) {
            order.status = 'confirmed';
            order.purchaseDate = orderDate;
            await order.save();

            const product = await Product.findOne({ id: order.productId });
            if (product) {
                orderDetails.push({
                    productName: product.name,
                    price: product.price,
                    orderId: order._id
                });
                totalPrice += product.price;
            }
        }

        console.log(`✅ ${orders.length} orders confirmed for user ${username}`);

        // Send a single combined email
        let emailSent = false;
        let emailError = null;

        if (user.email && transporter && orderDetails.length > 0) {
            try {
                const formattedDate = orderDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const orderItemsHTML = orderDetails.map((item, index) => `
                    <tr style="${index > 0 ? 'border-top: 1px solid #eee;' : ''}">
                        <td style="padding: 15px 5px; color: #333; font-weight: 600;">${item.productName}</td>
                        <td style="padding: 15px  5px; color: #333; text-align: right;">${item.price.toFixed(2)}</td>
                    </tr>
                `).join('');

                const confirmationEmail = await transporter.sendMail({
                    from: '"ModernShop" <noreply@modernshop.com>',
                    to: user.email,
                    subject: `Order Confirmation - ${orderDetails.length} Item${orderDetails.length > 1 ? 's' : ''}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px;">
                            <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                                <h1 style="color: #667eea; margin: 0 0 20px 0; font-size: 28px;">🎉 Order Confirmed!</h1>
                                <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${user.displayName || user.username},</p>
                                <p style="font-size: 16px; color: #333; line-height: 1.6;">Thank you for your purchase! Your ${orderDetails.length} order${orderDetails.length > 1 ? 's have' : ' has'} been confirmed.</p>
                                <div style="background: #f7f7f7; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 8px;">
                                    <h2 style="color: #667eea; margin: 0 0 15px 0; font-size: 20px;">Order Details</h2>
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <thead>
                                            <tr>
                                                <th style="text-align: left; padding-bottom: 10px; color: #666; font-weight: 600; border-bottom: 2px solid #667eea;">Product</th>
                                                <th style="text-align: right; padding-bottom: 10px; color: #666; font-weight: 600; border-bottom: 2px solid #667eea;">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>${orderItemsHTML}</tbody>
                                        <tfoot>
                                            <tr style="border-top: 2px solid #667eea;">
                                                <td style="padding-top: 15px; font-weight: 700; color: #333; font-size: 18px;">Total</td>
                                                <td style="padding-top: 15px; font-weight: 900; color: #667eea; font-size: 20px; text-align: right;">${totalPrice.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                    <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;"><strong>Order Date:</strong> ${formattedDate}</p>
                                </div>
                                <div style="background: #e8f5e9; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin: 20px 0;">
                                    <p style="margin: 0; color: #2e7d32; font-weight: 600;">✓ Your order${orderDetails.length > 1 ? 's are' : ' is'} being processed</p>
                                </div>
                                <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 30px;">You can view your order details anytime by visiting your <a href="https://shopping-cart-app-prod-3.onrender.com/cart.html" style="color: #667eea; text-decoration: none; font-weight: 600;">cart page</a>.</p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                                <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">This is an automated email. Please do not reply to this message.</p>
                            </div>
                        </div>
                    `
                });

                const etherealUrl = nodemailer.getTestMessageUrl(confirmationEmail);
                if (etherealUrl) {
                    console.log(`Combined order email preview: ${etherealUrl}`);
                    if (process.env.NODE_ENV !== 'production' && process.platform === 'win32') {
                        const { exec } = require('child_process');
                        exec(`start ${etherealUrl}`);
                    }
                } else {
                    console.log(`Combined order email sent to ${user.email}`);
                }

                emailSent = true;
            } catch (emailErr) {
                console.error('⚠️ Failed to send combined email (orders still confirmed):', emailErr);
                emailError = emailErr.message;
            }
        }

        res.json({ 
            message: emailSent ? `${orders.length} orders confirmed and email sent` : `${orders.length} orders confirmed (email failed)`,
            orderCount: orders.length,
            totalPrice,
            emailSent,
            emailError
        });
    } catch (err) {
        console.error('Error confirming bulk orders:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


// Get user's orders (cart) - only pending orders
app.get('/api/orders/:username', async (req, res) => {
    try {
        const { username } = req.params;
        // Find all orders that are NOT confirmed (pending or no status)
        const orders = await Order.find({ 
            username,
            $or: [
                { status: 'pending' },
                { status: { $exists: false } },
                { status: null }
            ]
        });
        
        res.json({ orders });
    } catch (err) {
        console.error('Error fetching orders:', err);
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





// (Multer and isAdmin middleware moved to top of file after model imports)

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
                        <p>Please login at: <a href="https://shopping-cart-app-prod-3.onrender.com/login.html">https://shopping-cart-app-prod-3.onrender.com/login.html</a></p>
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

        // Prevent deleting the main admin account (if it exists)
        const adminUser = await User.findOne({ username: 'admin' });
        let filteredIds = userIds;
        
        if (adminUser) {
            filteredIds = userIds.filter(id => id !== adminUser._id.toString());
        }

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
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Admin: Update user details
app.put('/api/admin/users/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { email, isVerified, isAdmin } = req.body;

        // Prevent modifying the main admin account's critical fields
        const userToUpdate = await User.findById(id);
        if (!userToUpdate) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (userToUpdate.username === 'admin' && (isVerified === false || isAdmin === false)) {
             return res.status(403).json({ error: 'Cannot remove admin status or verification from the main admin account' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { 
                email, 
                isVerified, 
                isAdmin 
            },
            { new: true }
        );

        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// User Profile Routes

// Get user's orders
// Get user's orders
app.get('/api/user/orders', isAuthenticated, async (req, res) => {
    try {
        const username = req.session.user || req.user?.username;
        
        if (!username) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const orders = await Order.find({ 
            username,
            status: 'confirmed' // Only show confirmed orders in order history
        })
            .sort({ createdAt: -1 })
            .lean(); // Use lean() for better performance and to allow modification

        // Manually populate product details
        const populatedOrders = await Promise.all(orders.map(async (order) => {
            const product = await Product.findOne({ id: order.productId });
            return {
                ...order,
                productId: product || null // Replace productId number with product object (or null)
            };
        }));

        res.json(populatedOrders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Upload profile photo
app.post('/api/user/profile-photo', isAuthenticated, upload.single('profilePhoto'), async (req, res) => {
    try {
        const username = req.session.user || req.user?.username;
        
        if (!username) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // In production, you would upload to cloud storage (S3, Cloudinary, etc.)
        // For now, we'll use the local file path
        const photoUrl = `/uploads/${req.file.filename}`;
        
        user.profilePhoto = photoUrl;
        await user.save();

        res.json({ 
            message: 'Profile photo uploaded successfully',
            photoUrl 
        });
    } catch (err) {
        console.error('Error uploading profile photo:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Test Email Route (For Debugging)
app.get('/api/test-email', async (req, res) => {
    try {
        const { email } = req.query;
        const targetEmail = email || (req.user ? req.user.email : null);

        if (!targetEmail) {
            return res.status(400).json({ error: 'Please provide an email query param or login first' });
        }

        if (!transporter) {
            // Try to re-initialize
            const { initializeEmailTransporter } = require('./src/config/email');
            transporter = await initializeEmailTransporter();
            if (!transporter) {
                return res.status(500).json({ 
                    error: 'Email transporter is NOT initialized. Check server logs and Vercel env vars.',
                    envCheck: {
                        hasGmailUser: !!(process.env.GMAIL_USER || process.env.EMAIL_USER),
                        hasGmailPass: !!(process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS)
                    }
                });
            }
        }

        // Verify connection
        try {
            await transporter.verify();
        } catch (verifyErr) {
            return res.status(500).json({ error: 'Transporter verification failed', details: verifyErr.message });
        }

        // Send email
        const info = await transporter.sendMail({
            from: '"ModernShop Test" <noreply@modernshop.com>',
            to: targetEmail,
            subject: 'Test Email from ModernShop Production',
            text: 'If you received this, your email configuration is working correctly!',
            html: '<h3>It Works! 🎉</h3><p>Your email configuration is correct.</p>'
        });

        res.json({ 
            message: 'Email sent successfully!', 
            messageId: info.messageId,
            preview: nodemailer.getTestMessageUrl(info)
        });

    } catch (err) {
        console.error('Test email error:', err);
        res.status(500).json({ error: 'Failed to send email', details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
