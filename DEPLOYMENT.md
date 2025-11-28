# Deployment Guide - ModernShop

## Option 1: Render (Recommended - Easiest)

### Prerequisites
1. GitHub account
2. MongoDB Atlas account (free tier)

### Step-by-Step Instructions

#### 1. Setup MongoDB Atlas (Database)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. Replace `<password>` with your actual password
7. Add `/shopping_cart` at the end: `mongodb+srv://username:password@cluster.mongodb.net/shopping_cart`

#### 2. Setup Google OAuth (if using Google login)
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URIs:
   - `https://your-app-name.onrender.com/auth/google/callback`
6. Copy Client ID and Client Secret

#### 3. Push Code to GitHub
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

#### 4. Deploy on Render
1. Go to https://render.com/ and sign up (use GitHub)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** modernshop (or your choice)
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/shopping_cart
   SESSION_SECRET = your-random-secret-key-here
   GOOGLE_CLIENT_ID = your-google-client-id
   GOOGLE_CLIENT_SECRET = your-google-client-secret
   GMAIL_USER = your-gmail@gmail.com
   GMAIL_APP_PASSWORD = your-gmail-app-password
   PORT = 3000
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Your app will be live at: `https://your-app-name.onrender.com`

#### 5. Update Google OAuth Redirect URL
1. Go back to Google Cloud Console
2. Update OAuth redirect URI to: `https://your-app-name.onrender.com/auth/google/callback`

#### 6. Update Code for Production URLs
You'll need to update hardcoded URLs in your code:
- Change `http://localhost:3000` to `https://your-app-name.onrender.com`
- Files to update: `server.js` (verification links, OAuth callbacks)

---

## Option 2: Railway

### Steps:
1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables (same as Render)
6. Railway will auto-detect Node.js and deploy
7. Get your URL from the "Settings" tab

---

## Option 3: Vercel + MongoDB Atlas

### Note: Requires refactoring to serverless functions

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard

---

## Important Notes

### Free Tier Limitations:
- **Render:** App sleeps after 15 min of inactivity (cold start ~30s)
- **Railway:** $5 credit/month (runs out if heavily used)
- **MongoDB Atlas:** 512MB storage limit

### Gmail App Password Setup:
1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an app password for "Mail"
4. Use this password (not your regular password) in `GMAIL_APP_PASSWORD`

### Security Checklist:
- ✅ Never commit `.env` file
- ✅ Use strong SESSION_SECRET
- ✅ Keep Google OAuth credentials secure
- ✅ Use MongoDB Atlas IP whitelist (or allow all: 0.0.0.0/0 for ease)

---

## Troubleshooting

### App won't start:
- Check environment variables are set correctly
- Check MongoDB connection string is valid
- Check build logs in Render dashboard

### Google OAuth not working:
- Verify redirect URI matches exactly
- Check Google Cloud Console has correct URLs
- Ensure GOOGLE_CLIENT_ID and SECRET are set

### Database connection failed:
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure database user has correct permissions

---

## Post-Deployment

1. Test all features:
   - User signup/login
   - Google OAuth
   - Email verification
   - Product purchase
   - Admin dashboard

2. Monitor logs in Render dashboard

3. Set up custom domain (optional):
   - Buy domain from Namecheap/GoDaddy
   - Add CNAME record pointing to Render URL
   - Configure in Render settings

---

## Need Help?

Common issues and solutions:
- **Cold starts:** Upgrade to paid tier or use a service like UptimeRobot to ping your app
- **File uploads not persisting:** Use cloud storage (Cloudinary, AWS S3)
- **Email not sending:** Check Gmail app password and SMTP settings

Good luck with your deployment! 🚀
