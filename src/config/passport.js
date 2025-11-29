const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const configurePassport = () => {
    console.log('Configuring Google OAuth Strategy...');
    console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
    console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');

    try {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.BASE_URL || 'http://localhost:3000'}/auth/google/callback`
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
};

module.exports = configurePassport;
