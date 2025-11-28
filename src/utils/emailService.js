const { getTransporter } = require('../config/email');
const nodemailer = require('nodemailer');

const sendOTPEmail = async (email, otp, purpose = 'login') => {
    const transporter = getTransporter();
    
    if (!transporter) {
        console.error('Email transporter not initialized');
        return;
    }

    const subject = purpose === 'login' ? 'Your Login OTP' : 'Your Verification Code';
    const title = purpose === 'login' ? 'Login Verification' : 'Verification Code';

    try {
        const info = await transporter.sendMail({
            from: '"ModernShop" <noreply@modernshop.com>',
            to: email,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px;">
                    <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                        <h2 style="color: #667eea; margin: 0 0 20px 0;">${title}</h2>
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">Your One-Time Password (OTP) is:</p>
                        <h1 style="color: #667eea; letter-spacing: 5px; text-align: center; font-size: 36px; margin: 20px 0;">${otp}</h1>
                        <p style="font-size: 14px; color: #666;">This code expires in 10 minutes.</p>
                        <p style="font-size: 12px; color: #999; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
                    </div>
                </div>
            `
        });

        const etherealUrl = nodemailer.getTestMessageUrl(info);
        if (etherealUrl) {
            console.log('OTP email sent: %s', etherealUrl);
            // Auto-open for dev convenience
            const { exec } = require('child_process');
            exec(`start ${etherealUrl}`);
        }
    } catch (error) {
        console.error('Error sending OTP email:', error);
    }
};

const sendVerificationEmail = async (email, username, token) => {
    const transporter = getTransporter();
    
    if (!transporter) {
        console.error('Email transporter not initialized');
        return;
    }

    const verificationLink = `https://shopping-cart-app-prod-3.onrender.com/api/verify?token=${token}`;

    try {
        const info = await transporter.sendMail({
            from: '"ModernShop" <noreply@modernshop.com>',
            to: email,
            subject: 'Verify your account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px;">
                    <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                        <h1 style="color: #667eea; margin: 0 0 20px 0;">Welcome to ModernShop!</h1>
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${username},</p>
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">Please click the button below to verify your account:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationLink}" style="background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Verify Account</a>
                        </div>
                        <p style="font-size: 12px; color: #999;">Or copy this link: ${verificationLink}</p>
                    </div>
                </div>
            `
        });

        const etherealUrl = nodemailer.getTestMessageUrl(info);
        if (etherealUrl) {
            console.log('Verification email sent: %s', etherealUrl);
        }
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

const sendWelcomeEmail = async (email, username) => {
    const transporter = getTransporter();
    
    if (!transporter) {
        console.error('Email transporter not initialized');
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: '"ModernShop" <noreply@modernshop.com>',
            to: email,
            subject: 'Welcome to ModernShop! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px;">
                    <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                        <h1 style="color: #667eea; margin: 0 0 20px 0; font-size: 28px;">Welcome to ModernShop! 🚀</h1>
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${username},</p>
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">Your account has been successfully verified. We're thrilled to have you on board!</p>
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">You can now login and start shopping for the best tech gadgets.</p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://shopping-cart-app-prod-3.onrender.com/login.html" style="background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Login Now</a>
                        </div>
                    </div>
                </div>
            `
        });

        const etherealUrl = nodemailer.getTestMessageUrl(info);
        if (etherealUrl) {
            console.log('Welcome email sent: %s', etherealUrl);
        }
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

const sendOrderConfirmationEmail = async (email, username, orderDetails) => {
    const transporter = getTransporter();
    
    if (!transporter) {
        console.error('Email transporter not initialized');
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: '"ModernShop" <noreply@modernshop.com>',
            to: email,
            subject: 'Order Confirmation - ModernShop',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px;">
                    <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                        <h1 style="color: #667eea; margin: 0 0 20px 0;">Order Confirmed! 🎉</h1>
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${username},</p>
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">Your order has been confirmed!</p>
                        <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin: 0 0 10px 0; color: #333;">Order Details:</h3>
                            <p style="margin: 5px 0;"><strong>Product:</strong> ${orderDetails.productName}</p>
                            <p style="margin: 5px 0;"><strong>Quantity:</strong> ${orderDetails.quantity}</p>
                            <p style="margin: 5px 0;"><strong>Total:</strong> $${orderDetails.total}</p>
                        </div>
                        <p style="font-size: 14px; color: #666;">Thank you for shopping with us!</p>
                    </div>
                </div>
            `
        });

        const etherealUrl = nodemailer.getTestMessageUrl(info);
        if (etherealUrl) {
            console.log('Order confirmation email sent: %s', etherealUrl);
        }
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
    }
};

const sendCredentialsEmail = async (email, username, password) => {
    const transporter = getTransporter();
    
    if (!transporter) {
        console.error('Email transporter not initialized');
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: '"ModernShop" <noreply@modernshop.com>',
            to: email,
            subject: 'Your ModernShop Account Credentials',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px;">
                    <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                        <h1 style="color: #667eea; margin: 0 0 20px 0;">Welcome to ModernShop!</h1>
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">An account has been created for you.</p>
                        <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Username:</strong> ${username}</p>
                            <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                        </div>
                        <p style="font-size: 14px; color: #e74c3c;"><strong>Important:</strong> Please change your password after your first login.</p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://shopping-cart-app-prod-3.onrender.com/login.html" style="background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Login Now</a>
                        </div>
                    </div>
                </div>
            `
        });

        const etherealUrl = nodemailer.getTestMessageUrl(info);
        if (etherealUrl) {
            console.log('Credentials email sent: %s', etherealUrl);
        }
    } catch (error) {
        console.error('Error sending credentials email:', error);
    }
};

module.exports = {
    sendOTPEmail,
    sendVerificationEmail,
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendCredentialsEmail
};
