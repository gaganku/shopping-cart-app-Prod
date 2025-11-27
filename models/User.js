const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for OAuth users
    googleId: { type: String, unique: true, sparse: true }, // Google OAuth ID
    email: { type: String, sparse: true }, // User's email (required for local signup, optional for Google initially but good to have)
    displayName: { type: String }, // User's display name from Google
    isVerified: { type: Boolean, default: false },
    isAdminVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    isAdmin: { type: Boolean, default: false },
    mustChangePassword: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Ensure either password or googleId is present
UserSchema.pre('save', function(next) {
    if (!this.password && !this.googleId) {
        next(new Error('User must have either password or googleId'));
    } else {
        next();
    }
});

module.exports = mongoose.model('User', UserSchema);
