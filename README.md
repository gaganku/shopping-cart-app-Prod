# 🛒 ModernShop - Full-Stack E-Commerce Application

A modern, full-featured e-commerce shopping cart application built with Node.js, Express, MongoDB, and vanilla JavaScript. Features include user authentication (local + Google OAuth), admin dashboard, product management with image uploads, and email notifications.

![ModernShop](https://img.shields.io/badge/Status-Active-success)
![Node.js](https://img.shields.io/badge/Node.js-v20.16.0-green)
![MongoDB](https://img.shields.io/badge/MongoDB-NoSQL-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 🔐 Authentication & Authorization
- **Local Authentication**: Email-based signup with verification
- **Google OAuth 2.0**: One-click sign-in with Google
- **Session Management**: Secure sessions with Passport.js
- **Role-Based Access**: Admin and regular user roles

### 🛍️ Shopping Experience
- **Product Catalog**: Browse products with images, descriptions, and prices
- **Shopping Cart**: Add items to cart with stock validation
- **Order Management**: View and confirm orders
- **Email Notifications**: Automated order confirmation emails

### 👨‍💼 Admin Dashboard
- **User Management**: 
  - View all registered users
  - Verify/unverify users
  - Bulk user upload via Excel
  - Delete users (with order cleanup)
  - Search and filter users
- **Product Management**:
  - Add products with image upload or URL
  - Update product stock with custom modal
  - Delete products with confirmation
  - Real-time product list updates
- **Analytics**: User and order reports

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Eye-friendly dark mode interface
- **Glassmorphism Effects**: Modern, premium design
- **Custom Modals**: Professional confirmation dialogs
- **Smooth Animations**: Micro-interactions for better UX

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v20.16.0 or higher)
- **MongoDB** (running locally or cloud instance)
- **Gmail Account** (for email notifications)
- **Google Cloud Project** (for OAuth - optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/gaganku/shopping-cart-app.git
cd shopping-cart-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory (see `.env.example` for reference):

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/shopping_cart

# Session Secret
SESSION_SECRET=your-secure-random-secret-key-change-this

# Gmail SMTP (for sending emails)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# Google OAuth 2.0 (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Server Port
PORT=3000
```

4. **Start MongoDB**

Make sure MongoDB is running on your system:
```bash
# On Windows (if installed as service)
net start MongoDB

# On macOS/Linux
sudo systemctl start mongodb
# or
mongod
```

5. **Run the application**
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📧 Email Setup

### Gmail App Password Setup

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password to your `.env` file

**Note**: If you don't configure Gmail, the app will use Ethereal (test email service) automatically.

## 🔑 Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID and Client Secret to `.env` file

See `GOOGLE_OAUTH_SETUP.md` for detailed instructions.

## 👑 Admin Setup

To create an admin user, run one of the helper scripts:

### Method 1: Using the admin setup script
```bash
node scripts/make_admin.js
```
Enter the username when prompted.

### Method 2: Direct MongoDB update
```bash
node scripts/set_admin.js
```

See `ADMIN_SETUP.md` for more details.

## 📁 Project Structure

```
shopping-cart-app/
├── models/              # MongoDB schemas
│   ├── User.js         # User model
│   ├── Product.js      # Product model
│   └── Order.js        # Order model
├── scripts/            # Utility scripts
│   ├── make_admin.js   # Make user admin
│   ├── set_admin.js    # Alternative admin script
│   └── bots.js         # UI bot functionality
├── uploads/            # Product image uploads
├── admin.html          # Admin dashboard
├── index.html          # Main shopping page
├── login.html          # Login page
├── signup.html         # Registration page
├── cart.html           # Shopping cart
├── complete-profile.html # OAuth profile completion
├── server.js           # Express server
├── app.js              # Frontend JavaScript
├── style.css           # Styles
├── .env                # Environment variables (gitignored)
└── package.json        # Dependencies
```

## 🎯 Usage

### For Users
1. Visit `http://localhost:3000`
2. Sign up with email or Google
3. Verify email (if using local auth)
4. Browse products and add to cart
5. Confirm orders and receive email confirmation

### For Admins
1. Log in with admin credentials
2. Navigate to Admin Dashboard (`/admin.html`)
3. Manage users (verify, delete, bulk upload)
4. Manage products (add, update stock, delete)
5. Download reports

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Passport.js** - Authentication middleware
- **Multer** - File upload handling
- **Nodemailer** - Email sending
- **express-session** - Session management

### Frontend
- **Vanilla JavaScript** - No frameworks
- **HTML5 & CSS3** - Modern web standards
- **Fetch API** - HTTP requests
- **FormData** - File uploads

## 🔒 Security Features

- Password storage (plain text - **TODO**: hash passwords with bcrypt)
- Email verification for new users
- Admin verification before purchasing
- Session-based authentication
- CORS protection
- Input validation
- Admin-only routes protected by middleware

## 📝 API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/auth/status` - Check auth status
- `GET /auth/google` - Google OAuth login
- `GET /auth/google/callback` - OAuth callback

### Products
- `GET /api/products` - Get all products
- `POST /api/admin/products` - Create product (admin)
- `PATCH /api/admin/products/:id/stock` - Update stock (admin)
- `DELETE /api/admin/products/:id` - Delete product (admin)

### Orders
- `POST /api/purchase` - Create order
- `GET /api/orders/:username` - Get user's orders
- `POST /api/orders/:id/confirm` - Confirm order
- `DELETE /api/orders/:id` - Cancel order

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/verify-user` - Verify/unverify user
- `POST /api/admin/users/bulk-delete` - Delete users
- `POST /api/admin/bulk-upload` - Upload users from Excel

## 🚧 Future Enhancements

- [ ] Password hashing with bcrypt
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Product categories and filtering
- [ ] User reviews and ratings
- [ ] Order history and tracking
- [ ] Wishlist functionality
- [ ] Admin analytics dashboard
- [ ] Docker containerization
- [ ] API rate limiting
- [ ] Redis caching
- [ ] Image optimization
- [ ] Search functionality
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Gagan Kumar**
- GitHub: [@gaganku](https://github.com/gaganku)

## 🙏 Acknowledgments

- Product images from [Unsplash](https://unsplash.com)
- Icons and UI inspiration from modern e-commerce platforms
- MongoDB and Express.js communities

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

⭐ **Star this repository if you find it helpful!** ⭐
