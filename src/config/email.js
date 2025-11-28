const nodemailer = require('nodemailer');

let transporter;

const initializeEmailTransporter = async () => {
    // Check if Gmail credentials are provided
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        // Use Gmail for real emails
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
        console.log('Gmail SMTP configured for sending real emails');
    } else {
        // Fallback to Ethereal for testing
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
        }
    }
    return transporter;
};

const getTransporter = () => transporter;

module.exports = { initializeEmailTransporter, getTransporter };
