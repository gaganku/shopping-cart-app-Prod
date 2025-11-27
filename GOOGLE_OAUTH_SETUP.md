# Google OAuth Setup Instructions

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or **Google Identity** API)

## Step 2: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application** as the application type
4. Configure the OAuth consent screen if prompted
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
6. Click **Create**
7. Copy your **Client ID** and **Client Secret**

## Step 3: Update Environment Variables

Open the `.env` file in your project root and update:

```
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
SESSION_SECRET=change_this_to_a_random_secure_string
```

## Step 4: Start the Application

1. Make sure MongoDB is running:
   ```
   mongod
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Testing Google OAuth

1. Click on "Sign in with Google" on the login page
2. Select your Google account
3. Grant permissions
4. You'll be redirected back to the shopping cart
5. Your Google display name should appear in the header

## Notes

- Users can sign in with either:
  - Traditional username/password
  - Google OAuth
- OAuth users will have auto-generated usernames based on their email
- Both authentication methods work side-by-side
