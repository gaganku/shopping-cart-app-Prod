# ModernShop - E-Commerce Platform

A modern, full-stack e-commerce application built with Node.js, Express, MongoDB, and vanilla JavaScript.

## 🚀 Quick Start

### Automated Setup

#### Windows
```powershell
.\setup.ps1
```

#### Mac/Linux
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

#### Installation Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd shopping_cart
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# Copy the example environment file
cp .env.example .env

# Update .env with your configuration
```

4. **Start MongoDB**
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

5. **Run the application**
```bash
npm start
```

6. **Access the application**
Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
shopping_cart/
├── public/              # Frontend static files
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   ├── index.html      # Main storefront
│   ├── login.html      # Login page
│   ├── signup.html     # Registration
│   ├── admin.html      # Admin dashboard
│   └── ...             # Other pages
├── src/                # Backend source code
│   ├── config/         # Configuration modules
│   │   ├── database.js # MongoDB connection
│   │   ├── email.js    # Email transporter
│   │   └── passport.js # OAuth configuration
│   ├── middleware/     # Custom middleware
│   │   └── auth.js     # Authentication
│   ├── models/         # Mongoose schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   └── routes/         # API routes (future)
├── uploads/            # User uploaded files
├── .env.example        # Environment template
├── .gitignore
├── package.json
├── README.md
├── server.js           # Application entry point
├── setup.ps1           # Windows setup script
└── setup.sh            # Unix/Mac setup script
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/shopping_cart

# Session Secret
SESSION_SECRET=your-super-secret-key-change-this

# Gmail Configuration (for email sending)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-specific-password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use this password in `GMAIL_APP_PASSWORD`

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID and Secret to `.env`

## 🎯 Features

### User Features
- User registration and authentication
- Google OAuth login with OTP verification
- Email verification
- Password reset
- Product browsing and search
- Shopping cart
- Order management
- Purchase history
- Account deletion

### Admin Features
- Admin dashboard
- User management
- Bulk user upload (Excel/CSV)
- Product management (CRUD)
- Order management
- User verification
- Analytics and reports

### Security Features
- Session-based authentication
- Google OAuth 2.0
- OTP verification for Google logins
- Email verification
- CORS protection
- Secure session cookies

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/signup              # Create new account
POST /api/login               # Login with credentials
POST /api/logout              # Logout
GET  /auth/google             # Google OAuth login
POST /api/auth/google/verify-otp    # Verify Google OTP
POST /api/auth/google/complete      # Complete Google signup
GET  /api/verify?token=xxx    # Verify email address
```

### Product Endpoints

```
GET    /api/products          # Get all products
POST   /api/admin/products    # Create product (admin)
PUT    /api/admin/products/:id      # Update product (admin)
DELETE /api/admin/products/:id      # Delete product (admin)
```

### Order Endpoints

```
POST /api/purchase            # Create new purchase
GET  /api/orders              # Get user orders
GET  /api/admin/all-orders    # Get all orders (admin)
```

### Admin Endpoints

```
GET    /api/admin/users                # Get all users
POST   /api/admin/bulk-upload          # Bulk upload users
POST   /api/admin/verify-user          # Verify user
DELETE /api/admin/users                # Delete users
POST   /api/admin/users/bulk-delete    # Bulk delete users
```

## 🧪 Testing

### Manual Testing
1. Create a test user via signup
2. Verify email (check console for test email link)
3. Login and browse products
4. Add items to cart
5. Complete purchase
6. Access admin panel (promote user to admin first)

### Test Data
Sample products are automatically seeded on first run.

## 🚢 Deployment

### Production Checklist
- [ ] Change `SESSION_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use production MongoDB instance (MongoDB Atlas)
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Add password hashing (bcrypt - TODO)
- [ ] Add input sanitization
- [ ] Add helmet.js for security headers
- [ ] Configure proper error logging
- [ ] Set up monitoring

### Deployment Platforms

#### Heroku
```bash
heroku create your-app-name
heroku config:set MONGODB_URI=<your-atlas-uri>
heroku config:set SESSION_SECRET=<random-string>
git push heroku main
```

#### Vercel/Netlify
Requires serverless configuration (not included in this version)

#### VPS (DigitalOcean, AWS EC2, etc.)
```bash
# Install Node.js and MongoDB
# Clone repository
# Configure .env
# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name modernshop
pm2 startup
pm2 save
```

## 🔐 Security Considerations

**Current Implementation:**
- Session-based authentication ✅
- Google OAuth ✅
- Email verification ✅
- OTP for Google logins ✅
- CORS protection ✅

**TODO for Production:**
- ⚠️ Password hashing (currently plain text - CRITICAL)
- Rate limiting
- Input sanitization
- SQL/NoSQL injection prevention
- XSS protection
- CSRF tokens
- Security headers (helmet.js)

## 🛠️ Development

### Running in Development Mode
```bash
npm start
```

### File Structure Best Practices
- Keep routes in `src/routes/`
- Keep business logic in `src/controllers/`
- Keep utilities in `src/utils/`
- Keep configurations in `src/config/`

### Adding New Features
1. Create a new branch
2. Implement feature
3. Test thoroughly
4. Update documentation
5. Submit pull request

## 📝 License

MIT License - See LICENSE file for details

## 👤 Author

Your Name / Organization

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📞 Support

For support, email your-email@example.com or open an issue.

## 🎓 Version History

- **v5.0** - Production-ready restructuring
- **v4.0** - Google Auth OTP & Welcome Emails
- **v3.0** - Admin dashboard enhancements
- **v2.0** - Core e-commerce features
- **v1.0** - Initial release

---

**Made with ❤️ using Node.js, Express, MongoDB**
