# ModernShop - E-Commerce Platform

A full-stack e-commerce application with user authentication, Google OAuth, admin dashboard, and email notifications.

## Features

- 🔐 User Authentication (Email/Password & Google OAuth)
- 📧 Email Verification & OTP-based 2FA
- 🛒 Shopping Cart & Product Management
- 👨‍💼 Admin Dashboard with User Management
- 📊 Bulk User Upload (Excel)
- 🔒 Conditional 2FA (10-day based)
- 📱 Responsive Design

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** Passport.js (Local & Google OAuth)
- **Email:** Nodemailer (Gmail SMTP)
- **File Upload:** Multer
- **Session:** Express-Session

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_gmail_app_password
```

## Installation

```bash
npm install
npm start
```

## Deployment

### Render
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your GitHub repository
4. Add environment variables
5. Deploy!

### Environment Variables for Production
- Set `MONGODB_URI` to your MongoDB Atlas connection string
- Update Google OAuth redirect URLs
- Set all other environment variables

## License

MIT
