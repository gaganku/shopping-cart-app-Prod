// Test script to verify email service with fallback OTP
require('dotenv').config();
const mongoose = require('mongoose');
const { initializeEmailTransporter } = require('./src/config/email');
const { sendOTPEmail } = require('./src/utils/emailService');

async function testEmailService() {
    console.log('\n🧪 Testing Email Service with Fallback OTP\n');
    console.log('='.repeat(50));
    
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Initialize email
    const transporter = await initializeEmailTransporter();
    console.log('✅ Email transporter initialized\n');
    
    // Test 1: Send OTP to a test email
    console.log('📧 Test 1: Sending OTP email...');
    const testEmail = process.env.GMAIL_USER || 'test@example.com';
    const testOtp = '123456';
    
    const result = await sendOTPEmail(testEmail, testOtp, 'login');
    
    console.log('\n📊 Email Send Result:');
    console.log('  Success:', result.success);
    console.log('  Ethereal URL:', result.etherealUrl || 'N/A (real email sent)');
    console.log('  Fallback OTP:', result.fallbackOtp || 'N/A (email succeeded)');
    console.log('  Error:', result.error || 'None');
    
    if (result.success) {
        console.log('\n✅ Email sent successfully!');
        if (result.etherealUrl) {
            console.log('🌐 Preview URL:', result.etherealUrl);
        } else {
            console.log('📬 Real email sent to:', testEmail);
        }
    } else {
        console.log('\n⚠️ Email failed - Fallback OTP available:', result.fallbackOtp);
        console.log('💡 This OTP would be displayed in the UI');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Test completed!\n');
    
    await mongoose.connection.close();
    process.exit(0);
}

testEmailService().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
