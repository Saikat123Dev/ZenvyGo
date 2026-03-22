# Quick Start: Firebase OTP Setup

## 🚀 Quick Setup (5 minutes)

### 1. Create Firebase Project
- Go to https://console.firebase.google.com/
- Create new project or use existing
- Enable **Authentication** > **Phone** provider

### 2. Get Credentials

**For Server:**
- Go to **Project Settings** > **Service accounts**
- Click **Generate new private key**
- Save as `serviceAccountKey.json` (DON'T commit to git!)

**For App:**
- Go to **Project Settings** > **General**
- Under "Your apps", add a **Web app**
- Copy the config values

### 3. Configure Server

```bash
cd server
cp .env.example .env
# Edit .env:
```

```env
OTP_DRIVER=firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CREDENTIALS_PATH=/absolute/path/to/serviceAccountKey.json
```

### 4. Configure App

```bash
cd zenvyGo
cp .env.example .env
# Edit .env:
```

```env
EXPO_PUBLIC_API_URL=http://your-server-ip:3000/api/v1
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
# ... (copy all values from Firebase)
```

### 5. Test with Test Numbers (Optional)

In Firebase Console > Authentication > Settings:
- Add test phone: `+1 650-555-1234`
- Set code: `123456`

### 6. Run!

**Server:**
```bash
cd server
pnpm install  # if not done already
pnpm dev
```

**App:**
```bash
cd zenvyGo
npm install  # if not done already
npm start
```

## 📱 Usage Flow

1. User enters phone number (+971501234567)
2. App sends request to Firebase
3. User receives OTP via SMS
4. User enters OTP
5. App verifies with Firebase
6. Server validates and returns JWT tokens
7. User logged in! ✅

## ⚠️ Important Notes

- **NEVER commit `serviceAccountKey.json`** - add to `.gitignore`
- Use HTTPS in production
- Phone number must include country code
- Codes expire in a few minutes
- Firebase has rate limits (use test numbers for dev)

## 🐛 Common Issues

**"Invalid phone number"**
- Must include country code (e.g., +971 not 971)

**"Network error"**
- Check server is running
- Verify `EXPO_PUBLIC_API_URL` in app `.env`
- Check CORS settings

**"Too many requests"**
- Use test phone numbers during development
- Wait a few minutes before retry

## 📖 Full Documentation

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete setup guide.

## 🔐 Security Checklist

- [ ] `serviceAccountKey.json` in `.gitignore`
- [ ] Environment variables not hardcoded
- [ ] HTTPS enabled in production
- [ ] Authorized domains configured
- [ ] Rate limiting enabled
- [ ] App Check enabled (production)

## 🎉 You're Done!

Your app now has secure Firebase OTP authentication!
