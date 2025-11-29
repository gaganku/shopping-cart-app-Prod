const nodemailer = require('nodemailer');

let transporter;

const initializeEmailTransporter = async () => {
    // Check if Gmail credentials are provided (support both naming conventions)
    const user = process.env.GMAIL_USER || process.env.EMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

    // 1. Check for Generic SMTP (Resend, SendGrid, etc.)
    if (process.env.SMTP_HOST && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER || 'resend',
                pass: process.env.SMTP_PASS
            }
        });
        console.log('✅ SMTP configured (Resend/Provider)');
        
        try {
            await transporter.verify();
            console.log('✅ SMTP connection verified');
        } catch (err) {
            console.error('❌ SMTP verification failed:', err.message);
            transporter = null;
        }
    }
    // 2. Check if Gmail credentials are provided (Fallback)
    else if (user && pass) {
        // Use Gmail for real emails
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: pass
            }
        });
        
        // Verify connection
        try {
            await transporter.verify();
            console.log('✅ Gmail SMTP configured and verified');
        } catch (err) {
            console.error('❌ Gmail SMTP verification failed:', err.message);
            transporter = null;
        }
    } else {
        // 3. Fallback to Ethereal
        console.log('Gmail credentials not found, using Ethereal test email...');
        try {
            const account = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: account.smtp.host,
                port: account.smtp.port,
                secure: account.smtp.secure,
                auth: {
                    user: account.user,
                    pass: account.pass
                }
            });
            console.log('Ethereal Email configured (test mode)');
        } catch (err) {
            console.error('Failed to create test account:', err);
            transporter = null;
        }
    }
    return transporter;
};

const getTransporter = () => transporter;

module.exports = { initializeEmailTransporter, getTransporter };
