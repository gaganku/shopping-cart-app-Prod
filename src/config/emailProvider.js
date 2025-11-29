const nodemailer = require('nodemailer');

/**
 * Build a Nodemailer transporter.
 *   - In development we try Gmail first.
 *   - In production we use a generic SMTP (e.g., SendGrid).
 *   - All errors are logged so you can see them in Vercel logs.
 */
const buildTransporter = async () => {
  // ---------- 1️⃣ Development – Gmail ----------
  const devUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const devPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

  if (process.env.NODE_ENV !== 'production' && devUser && devPass) {
    try {
      const gmailTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: devUser, pass: devPass },
      });
      await gmailTransport.verify();
      console.log('✅ Gmail SMTP verified (dev)');
      return gmailTransport;
    } catch (err) {
      console.error('❌ Gmail verification failed (dev):', err.message);
      // fall through to SMTP provider for dev as well
    }
  }

  // ---------- 2️⃣ Production – Generic SMTP (SendGrid, Mailgun, etc.) ----------
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.error('❌ No SMTP configuration found. Set SMTP_HOST, SMTP_USER, SMTP_PASS.');
    return null;
  }

  try {
    const smtpTransport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: { user, pass },
    });
    await smtpTransport.verify();
    console.log('✅ SMTP (production) verified – ready to send real emails');
    return smtpTransport;
  } catch (err) {
    console.error('❌ SMTP verification failed:', err.message);
    return null;
  }
};

module.exports = { buildTransporter };
