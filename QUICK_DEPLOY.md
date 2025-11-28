# Quick Deployment Checklist

## ✅ Step 1: GitHub (IN PROGRESS)
- [ ] Create GitHub repository
- [ ] Push code to GitHub

## ✅ Step 2: MongoDB Atlas Setup (5 minutes)

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (use Google for quick signup)
3. Choose FREE tier (M0)
4. Cloud Provider: AWS
5. Region: Choose closest to you
6. Cluster Name: Keep default or name it "shopping-cart"
7. Click "Create Cluster" (takes 3-5 minutes)

### Get Connection String:
1. Click "Connect" button on your cluster
2. Choose "Connect your application"
3. Driver: Node.js, Version: 4.1 or later
4. Copy the connection string
5. Replace `<password>` with your database password
6. Add `/shopping_cart` at the end

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/shopping_cart
```

### Important: Whitelist IP
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

---

## ✅ Step 3: Render Setup (5 minutes)

1. Go to: https://render.com/
2. Sign up with GitHub (easiest)
3. Click "New +" → "Web Service"
4. Click "Connect account" to link GitHub
5. Find your repository and click "Connect"

### Configure Service:
- **Name:** `modernshop` (or your choice - this will be your URL)
- **Region:** Choose closest
- **Branch:** `fresh-start` (or `main`)
- **Root Directory:** leave blank
- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** Free

### Add Environment Variables:
Click "Advanced" → "Add Environment Variable" and add these:

```
MONGODB_URI = [paste your MongoDB Atlas connection string]
SESSION_SECRET = [random string like: my-super-secret-key-12345]
PORT = 3000
```

### Optional (for Google OAuth):
```
GOOGLE_CLIENT_ID = [your Google client ID]
GOOGLE_CLIENT_SECRET = [your Google client secret]
```

### Optional (for Gmail):
```
GMAIL_USER = [your-email@gmail.com]
GMAIL_APP_PASSWORD = [your Gmail app password]
```

7. Click "Create Web Service"
8. Wait 5-10 minutes for deployment
9. Your app will be live at: `https://modernshop.onrender.com`

---

## ✅ Step 4: Post-Deployment

### Update Google OAuth (if using):
1. Go to Google Cloud Console
2. Update redirect URI to: `https://your-app-name.onrender.com/auth/google/callback`

### Test Your App:
1. Visit your Render URL
2. Try signing up
3. Test login
4. Check admin dashboard

---

## 🎉 You're Done!

Your app is now live and accessible worldwide!

### Free Tier Limitations:
- Render: Sleeps after 15 min inactivity (30s cold start)
- MongoDB: 512MB storage
- No custom domain on free tier

### To Keep App Awake:
Use a service like UptimeRobot to ping your app every 5 minutes

---

## Need Help?

Common issues:
- **Build failed:** Check package.json has all dependencies
- **Can't connect to DB:** Verify MongoDB connection string and IP whitelist
- **App crashes:** Check Render logs for errors
