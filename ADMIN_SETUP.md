# Admin Bulk User Upload - Setup Instructions

## Quick Setup

### 1. Set Admin User

You need to manually set a user as admin in the database. You have two options:

#### Option A: Set your existing user as admin
Run this in MongoDB shell or use a script:
```javascript
db.users.updateOne(
  { username: "your-username" },  // Replace with your username
  { $set: { isAdmin: true } }
)
```

#### Option B: Add admin email to .env (for future signups)
Add this line to your `.env` file:
```
ADMIN_EMAIL=admin@example.com
```

Then sign up with that email address.

### 2. Create uploads directory
The server needs a directory to temporarily store uploaded files:
```bash
mkdir uploads
```

### 3. Restart the server
```bash
node server.js
```

## How to Use

### 1. Access Admin Dashboard
- Login to your account
- Navigate to: `http://localhost:3000/admin.html`
- If you're not an admin, you'll be redirected

### 2. Prepare Excel File
Create an Excel file (.xlsx) with one column named `email`:

| email |
|-------|
| user1@example.com |
| user2@example.com |
| user3@example.com |

### 3. Upload File
- Click "Select File" on the admin dashboard
- Choose your Excel file
- Click "Upload Users"

### 4. Check Results
- The system will show which users were created successfully
- Failed users will be listed with reasons
- Welcome emails will be sent to each user with their credentials

### 5. View Welcome Emails
- Check your server console for Ethereal email links
- Each user will receive an email with:
  - Their username (generated from email)
  - Temporary password
  - Link to login

## Features

- ✅ Auto-generate usernames from email addresses
- ✅ Generate secure random passwords
- ✅ Send welcome emails with credentials
- ✅ Auto-verify bulk-created users
- ✅ Force password change on first login
- ✅ View all users in admin dashboard
- ✅ See user status (verified/unverified, admin/user)

## Security Notes

- Only users with `isAdmin: true` can access admin features
- Passwords are 12 characters with mixed case, numbers, and symbols
- Users must change password on first login
- Bulk-created users are auto-verified (admin pre-approved)
