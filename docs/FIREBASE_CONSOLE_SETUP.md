# Firebase Console Setup Guide for ZenvyGo

**Project:** zenvygov
**App Name:** ZenvyGo
**Package Name (Android):** `com.zenvygo.app`
**Bundle ID (iOS):** `com.zenvygo.app`

---

## 🎯 Complete Firebase Console Setup Steps

### Step 1: Access Your Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click on your project **"zenvygov"** (or create it if not exists)
3. You'll land on the Project Overview page

---

### Step 2: Enable Phone Authentication

1. In the left sidebar, click **"Authentication"**
2. Click **"Get started"** button (if first time)
3. Click on the **"Sign-in method"** tab at the top
4. Scroll down and find **"Phone"** in the providers list
5. Click on **"Phone"** row to expand it
6. Toggle the **"Enable"** switch to ON
7. Click **"Save"** button

**✅ Phone Authentication is now enabled!**

---

### Step 3: Register Android App

1. Go back to **Project Overview** (home icon on left sidebar)
2. Click the **Android icon** (robot) to add Android app
3. Fill in the form:
   - **Android package name:** `com.zenvygo.app`
   - **App nickname (optional):** ZenvyGo Android
   - **Debug signing certificate SHA-1 (optional):** Leave blank for now
4. Click **"Register app"** button
5. **Download `google-services.json`** file
6. Save it to: `zenvyGo/android/app/google-services.json`
7. Click **"Next"** through the remaining steps
8. Click **"Continue to console"**

**Important:** Add this file to your `.gitignore`:
```bash
echo "android/app/google-services.json" >> zenvyGo/.gitignore
```

---

### Step 4: Register iOS App

1. Go back to **Project Overview**
2. Click the **iOS icon** (apple) to add iOS app
3. Fill in the form:
   - **iOS bundle ID:** `com.zenvygo.app`
   - **App nickname (optional):** ZenvyGo iOS
   - **App Store ID (optional):** Leave blank
4. Click **"Register app"** button
5. **Download `GoogleService-Info.plist`** file
6. Click **"Next"** through the remaining steps
7. Click **"Continue to console"**

**For Expo users:** You'll configure this file in EAS Build later.

---

### Step 5: Get Service Account Key (For Server)

1. In the left sidebar, click the **⚙️ gear icon** next to "Project Overview"
2. Click **"Project settings"**
3. Click on the **"Service accounts"** tab
4. Click **"Generate new private key"** button
5. A dialog appears warning about keeping it confidential
6. Click **"Generate key"** button
7. A JSON file downloads (e.g., `zenvygov-firebase-adminsdk-xxxxx.json`)
8. **IMPORTANT:**
   - Rename it to `serviceAccountKey.json`
   - Save it in a secure location (NOT in git repo)
   - Example location: `/home/saikat/secrets/zenvygo/serviceAccountKey.json`

**Add to server's `.env`:**
```env
FIREBASE_PROJECT_ID=zenvygov
FIREBASE_CREDENTIALS_PATH=/home/saikat/secrets/zenvygo/serviceAccountKey.json
```

---

### Step 6: Configure Test Phone Numbers (For Development)

1. In **Authentication** section, click **"Settings"** tab
2. Scroll down to **"Phone numbers for testing"**
3. Click **"Add phone number"** button
4. Add test numbers to avoid SMS costs during development:

   **Example test numbers:**
   - Phone: `+1 650-555-0001` → Code: `123456`
   - Phone: `+971 50-555-0001` → Code: `123456`
   - Phone: `+91 98765-43210` → Code: `123456`

5. Click **"Add"** for each number
6. Click **"Save"**

**✅ You can now test without real SMS!**

---

### Step 7: Configure Authorized Domains

1. In **Authentication** section, click **"Settings"** tab
2. Scroll to **"Authorized domains"** section
3. By default, you'll see:
   - `localhost`
   - `zenvygov.firebaseapp.com`
   - `zenvygov.web.app`

4. If you're hosting your app on a custom domain, add it here:
   - Click **"Add domain"**
   - Enter your domain (e.g., `app.zenvygo.com`)
   - Click **"Add"**

---

### Step 8: Enable App Check (Recommended for Production)

1. In the left sidebar, click **"App Check"**
2. Click **"Get started"** button
3. For Android app:
   - Click **"Apps"** tab
   - Select your Android app
   - Click **"Play Integrity"**
   - Follow the setup instructions
4. For iOS app:
   - Select your iOS app
   - Click **"App Attest"**
   - Follow the setup instructions

**Note:** App Check prevents abuse and unauthorized API access.

---

### Step 9: Configure Usage Quotas (Optional but Recommended)

1. In the left sidebar, click **"Authentication"**
2. Click **"Usage"** tab
3. Review the quotas:
   - Phone Auth: 10,000 verifications/month (free)
   - After that: $0.06 per verification

4. Set up **billing alerts**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select project **"zenvygov"**
   - Go to **Billing** > **Budgets & alerts**
   - Create budget alert

---

### Step 10: Configure Android App SHA-1 (For Production)

1. Generate your SHA-1 certificate fingerprint:
   ```bash
   cd zenvyGo/android
   ./gradlew signingReport
   ```

2. Copy the SHA-1 fingerprint

3. In Firebase Console:
   - Go to **Project Settings**
   - Scroll to **"Your apps"** section
   - Click on your Android app
   - Scroll to **"SHA certificate fingerprints"**
   - Click **"Add fingerprint"**
   - Paste your SHA-1
   - Click **"Save"**

**Note:** You'll need different fingerprints for debug and release builds.

---

## 🔧 Server Configuration

### Option 1: Using Service Account File (Recommended)

Update `/home/saikat/workspce/internship/vehical-assistant/server/.env`:

```env
# OTP Configuration
OTP_DRIVER=firebase

# Firebase Admin SDK
FIREBASE_PROJECT_ID=zenvygov
FIREBASE_CREDENTIALS_PATH=/home/saikat/secrets/zenvygo/serviceAccountKey.json
```

### Option 2: Using Environment Variables (For Cloud Deployment)

Open your `serviceAccountKey.json` and extract values:

```env
# OTP Configuration
OTP_DRIVER=firebase

# Firebase Admin SDK
FIREBASE_PROJECT_ID=zenvygov
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@zenvygov.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

---

## 📱 App Configuration

The app `.env` file is already configured with your Firebase project values:

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyA4F8StXfE2q0yCz3MaEUKV9qjOWRDXKkk
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=zenvygov.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=zenvygov
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=zenvygov.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1020738236243
EXPO_PUBLIC_FIREBASE_APP_ID=1:1020738236243:web:8b504d4d6ea78f2e913ba6
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-SZYGX22MJT
```

**✅ Already configured!** (file created at `/zenvyGo/.env`)

---

## 🏗️ Android Setup

### 1. Place google-services.json

After downloading from Firebase:
```bash
mv ~/Downloads/google-services.json /home/saikat/workspce/internship/vehical-assistant/zenvyGo/android/app/
```

### 2. Update android/build.gradle

Edit `zenvyGo/android/build.gradle`:

```gradle
buildscript {
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.0'
        classpath 'com.google.gms:google-services:4.4.0'  // Add this line
    }
}
```

### 3. Update android/app/build.gradle

Edit `zenvyGo/android/app/build.gradle`:

Add at the bottom of the file:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### 4. Rebuild the app

```bash
cd zenvyGo
npm run android
```

---

## 🍎 iOS Setup (If using Bare React Native)

### 1. Place GoogleService-Info.plist

1. Open Xcode
2. Open `zenvyGo/ios/ZenvyGo.xcworkspace`
3. Right-click on the project in the file navigator
4. Select "Add Files to ZenvyGo"
5. Select `GoogleService-Info.plist`
6. Ensure "Copy items if needed" is checked

### 2. Update Podfile

Edit `zenvyGo/ios/Podfile` and ensure Firebase pods are included:

```ruby
pod 'Firebase/Auth'
```

### 3. Install pods

```bash
cd zenvyGo/ios
pod install
```

---

## 🧪 Testing the Setup

### Test with Test Phone Numbers

1. Use one of your configured test numbers:
   - Phone: `+1 650-555-0001`
   - Expected OTP: `123456`

2. In the app:
   - Select country: United States (+1)
   - Enter: `650-555-0001`
   - Click "Send OTP"
   - Enter OTP: `123456`
   - Should log in successfully ✅

### Test with Real Phone Number

1. Use your actual phone number with country code
2. You'll receive a real SMS from Firebase
3. Enter the 6-digit code
4. Should log in successfully ✅

---

## 📊 Monitor Usage

### View Authentication Activity

1. Go to **Authentication** in Firebase Console
2. Click **"Users"** tab - see registered users
3. Click **"Usage"** tab - see verification counts
4. Click **"Templates"** tab - customize SMS templates (paid feature)

### View Logs

1. In left sidebar, click **"Firestore"** or **"Analytics"**
2. Or go to [Google Cloud Console](https://console.cloud.google.com/)
3. Select project **"zenvygov"**
4. Go to **Logging** > **Logs Explorer**
5. Filter for authentication events

---

## 🚨 Important Security Settings

### 1. Restrict API Key (Production Only)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project **"zenvygov"**
3. Go to **APIs & Services** > **Credentials**
4. Find your API key (Browser key)
5. Click **Edit**
6. Under **"Application restrictions"**, select:
   - **Android apps** → Add package: `com.zenvygo.app`
   - **iOS apps** → Add bundle ID: `com.zenvygo.app`
7. Under **"API restrictions"**, select **"Restrict key"**
8. Check only:
   - Identity Toolkit API
   - Firebase Authentication
9. Click **"Save"**

### 2. Enable reCAPTCHA for Web

1. Go to **Authentication** > **Settings**
2. Scroll to **"App verification"**
3. Ensure **"Enable reCAPTCHA Enterprise"** is ON
4. Add your domain to **"Authorized domains"**

---

## 🎉 Verification Checklist

Complete this checklist to ensure everything is set up:

**Firebase Console:**
- [ ] Project "zenvygov" exists
- [ ] Phone Authentication provider enabled
- [ ] Android app registered (`com.zenvygo.app`)
- [ ] iOS app registered (`com.zenvygo.app`)
- [ ] Service account key downloaded
- [ ] Test phone numbers added (optional)
- [ ] Authorized domains configured

**Server Setup:**
- [ ] `serviceAccountKey.json` saved securely (NOT in git)
- [ ] `server/.env` configured with Firebase credentials
- [ ] `OTP_DRIVER=firebase` set
- [ ] Firebase Admin SDK initializes without errors

**App Setup:**
- [ ] `zenvyGo/.env` exists with Firebase config
- [ ] `google-services.json` in `android/app/` directory
- [ ] `GoogleService-Info.plist` added to iOS project (if applicable)
- [ ] `@react-native-firebase` packages installed
- [ ] App builds successfully

**Testing:**
- [ ] Test phone number works (e.g., +1 650-555-0001)
- [ ] Real phone number receives SMS
- [ ] OTP verification completes successfully
- [ ] User receives JWT tokens from server
- [ ] User can navigate to main app

---

## 📞 Firebase Phone Auth Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      ZenvyGo App                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 1. User enters phone: +971501234567
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│         auth().signInWithPhoneNumber(phoneNumber)           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 2. Firebase sends SMS
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    User's Phone                             │
│                  "Your code: 123456"                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 3. User enters OTP in app
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│         signInWithCredential(credential)                    │
│                  ↓                                           │
│         Firebase verifies OTP                               │
│                  ↓                                           │
│         Returns: User + ID Token                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 4. App sends ID Token to server
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│        POST /api/v1/auth/firebase/verify                    │
│        { idToken: "firebase-id-token" }                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 5. Server verifies with Firebase Admin SDK
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│         firebaseAdmin.verifyIdToken(token)                  │
│                  ↓                                           │
│         Extract phone number                                │
│                  ↓                                           │
│         Find/Create user in database                        │
│                  ↓                                           │
│         Issue JWT access + refresh tokens                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 6. Return app tokens
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    ZenvyGo App                              │
│              User logged in! ✅                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Best Practices

### Server Side
1. ✅ **Never commit `serviceAccountKey.json`** to git
2. ✅ Store it outside the repository
3. ✅ Use restrictive file permissions: `chmod 600 serviceAccountKey.json`
4. ✅ In production, use environment variables or cloud secrets manager
5. ✅ Verify Firebase ID tokens on every authenticated request
6. ✅ Implement rate limiting (already done)
7. ✅ Use HTTPS in production

### Client Side
1. ✅ **Never hardcode API keys** - use environment variables
2. ✅ Don't commit `.env` file to git
3. ✅ Enable App Check before production launch
4. ✅ Implement proper error handling
5. ✅ Clear tokens on logout
6. ✅ Handle token refresh automatically

### Firebase Console
1. ✅ Restrict API keys to specific apps
2. ✅ Enable App Check
3. ✅ Set up billing alerts
4. ✅ Monitor usage regularly
5. ✅ Use test phone numbers in development
6. ✅ Review authentication logs

---

## 🐛 Common Issues & Solutions

### ❌ "Error: google-services.json not found"
**Solution:**
- Download from Firebase Console
- Place in `zenvyGo/android/app/google-services.json`
- Rebuild app

### ❌ "CONFIGURATION_NOT_FOUND"
**Solution:**
- Ensure package name matches: `com.zenvygo.app`
- Check `google-services.json` is in correct location
- Clean and rebuild: `cd android && ./gradlew clean`

### ❌ "Invalid phone number"
**Solution:**
- Must include country code (e.g., `+971501234567`)
- No spaces or special characters
- Use E.164 format

### ❌ "Too many requests"
**Solution:**
- Firebase rate limits phone auth
- Use test phone numbers during development
- Wait 1-2 hours before retrying with same number

### ❌ "Server: Firebase credentials not configured"
**Solution:**
- Check `.env` file has `FIREBASE_PROJECT_ID` and `FIREBASE_CREDENTIALS_PATH`
- Verify path to `serviceAccountKey.json` is correct
- Ensure file permissions are readable

### ❌ "Network request failed"
**Solution:**
- Check server is running: `cd server && pnpm dev`
- Verify `EXPO_PUBLIC_API_URL` in app `.env`
- Check device/emulator can reach server
- For Android emulator: use `http://10.0.2.2:3000/api/v1`
- For physical device: use your computer's IP

---

## 📝 Quick Setup Summary

```bash
# 1. Firebase Console
# ✅ Enable Phone Authentication
# ✅ Download google-services.json → zenvyGo/android/app/
# ✅ Download serviceAccountKey.json → secure location
# ✅ Add test phone numbers

# 2. Server Configuration
cd server
cp .env.example .env
# Edit .env:
# OTP_DRIVER=firebase
# FIREBASE_PROJECT_ID=zenvygov
# FIREBASE_CREDENTIALS_PATH=/path/to/serviceAccountKey.json

# Install Firebase Admin SDK
pnpm install firebase-admin

# Start server
pnpm dev

# 3. App Configuration
cd ../zenvyGo
# .env is already created with your Firebase config ✅

# Install dependencies (already done ✅)
npm install

# Start app
npm start

# 4. Test
# Use test phone: +1 650-555-0001
# Enter OTP: 123456
# Should work! 🎉
```

---

## 📚 Additional Resources

- [Firebase Phone Auth Docs](https://firebase.google.com/docs/auth/android/phone-auth)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [React Native Firebase Docs](https://rnfirebase.io/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

---

## 🆘 Need Help?

If you encounter issues:

1. Check Firebase Console > **Authentication** > **Users** - see if users are being created
2. Check server logs for Firebase errors
3. Check app console for Firebase SDK errors
4. Verify all environment variables are set correctly
5. Ensure `google-services.json` package name matches `app.json`

---

## ✅ You're All Set!

Your ZenvyGo app is now configured with Firebase Phone Authentication! 🎉

Test with a test phone number first, then try with your real phone.
