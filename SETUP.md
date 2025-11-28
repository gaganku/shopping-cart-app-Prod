# Development Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Gmail account (for email functionality)
- Google OAuth credentials (optional)

## Installation

### 1. Clone and Install
```bash
git clone <repository-url>
cd shopping_cart
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/shopping_cart

# Session
SESSION_SECRET=your-secret-key-change-this-in-production

# Gmail (for email sending)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-specific-password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Server
PORT=3000
```

### 3. Start MongoDB
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

### 4. Run the Application
```bash
npm start
```

The server will start at `http://localhost:3000`

## Project Structure

```
shopping_cart/
├── public/              # Frontend files (served statically)
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   ├── index.html      # Main page
│   ├── login.html      # Login page
│   ├── signup.html     # Signup page
│   ├── admin.html      # Admin dashboard
│   └── ...            # Other pages
├── src/                # Backend source code
│   ├── config/         # Configuration modules
│   ├── middleware/     # Custom middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes (future)
│   └── utils/          # Utility functions (future)
├── uploads/            # User uploaded files
├── .env                # Environment variables (create this)
├── .gitignore
├── package.json
├── README.md
└── server.js           # Main entry point
```

## Development Workflow

### Running in Development
```bash
npm start
```

### Testing Email Functionality
If you don't have Gmail configured, the app will use Ethereal (fake SMTP) for testing.
Emails will be logged in the console with links to view them.

### Creating Admin User
Access `/admin.html` after logging in with any account, then use the admin panel to promote users.

## API Endpoints

### Authentication
- `POST /api/signup` - Create new account
- `POST /api/login` - Login with username/password
- `POST /api/logout` - Logout
- `GET /auth/google` - Google OAuth login
- `POST /api/auth/google/verify-otp` - Verify Google login OTP
- `POST /api/auth/google/complete` - Complete Google signup

### Products
- `GET /api/products` - Get all products
- `POST /api/admin/products` - Add product (admin only)
- `PUT /api/admin/products/:id` - Update product (admin only)
- `DELETE /api/admin/products/:id` - Delete product (admin only)

### Orders
- `POST /api/purchase` - Create purchase
- `GET /api/orders` - Get user orders
- `GET /api/admin/all-orders` - Get all orders (admin only)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `POST /api/admin/bulk-upload` - Bulk upload users (admin only)
- `POST /api/admin/verify-user` - Verify user (admin only)
- `DELETE /api/admin/users` - Delete users (admin only)

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`

### Email Not Sending
- Verify Gmail credentials in `.env`
- Enable "Less secure app access" or use App Password

### Port Already in Use
- Change `PORT` in `.env`
- Kill existing process: `taskkill /F /IM node.exe` (Windows)

## Production Deployment

### Environment Variables
Ensure all production variables are set:
- Use strong `SESSION_SECRET`
- Set `NODE_ENV=production`
- Use production MongoDB instance
- Configure proper CORS origins

### Security Checklist
- [ ] Change default secrets
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Add password hashing (bcrypt)
- [ ] Sanitize user inputs
- [ ] Add helmet.js for security headers

## Contributing
1. Create a feature branch from `main`
2. Make changes
3. Test thoroughly
4. Submit pull request
