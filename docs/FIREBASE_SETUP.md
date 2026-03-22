# Firebase OTP Integration Setup Guide

This guide explains how to set up Firebase Phone Authentication for OTP verification in your Vehicle Assistant application.

## Overview

The application uses Firebase Phone Authentication to send and verify OTP codes. The flow works as follows:

1. **Client (React Native app)**: Initiates phone verification with Firebase
2. **Firebase**: Sends OTP to the user's phone
3. **User**: Enters the OTP code
4. **Client**: Verifies OTP with Firebase and receives an ID token
5. **Server**: Validates the Firebase ID token and issues app-specific JWT tokens

## Prerequisites

- A Firebase project
- Firebase Authentication enabled
- Phone Authentication provider enabled in Firebase Console

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Phone Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Phone** provider
3. Enable the **Phone** sign-in provider
4. Click **Save**

## Step 3: Register Your Apps

### For Android:
1. In Firebase Console, go to **Project Settings**
2. Under "Your apps", click **Add app** > **Android**
3. Enter your package name: `com.zenvygo.app`
4. Download `google-services.json`
5. Place it in `zenvyGo/android/app/google-services.json`

### For iOS:
1. In Firebase Console, go to **Project Settings**
2. Under "Your apps", click **Add app** > **iOS**
3. Enter your bundle ID: `com.zenvygo.app`
4. Download `GoogleService-Info.plist`
5. Place it in your iOS project

### For Web (Development):
1. In Firebase Console, go to **Project Settings**
2. Under "Your apps", click **Add app** > **Web**
3. Register your app
4. Copy the configuration values

## Step 4: Get Firebase Admin SDK Credentials

### Method 1: Service Account Key (Recommended for Production)

1. In Firebase Console, go to **Project Settings** > **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Store it securely (DO NOT commit to git)
5. Update server `.env`:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CREDENTIALS_PATH=/path/to/serviceAccountKey.json
   ```

### Method 2: Environment Variables (For Cloud Deployment)

1. In Firebase Console, go to **Project Settings** > **Service accounts**
2. Copy the service account email and project ID
3. Generate a private key
4. Update server `.env`:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKey\n-----END PRIVATE KEY-----\n"
   ```

## Step 5: Configure Server Environment

1. Copy `server/.env.example` to `server/.env`
2. Update Firebase configuration:
   ```env
   OTP_DRIVER=firebase
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CREDENTIALS_PATH=/path/to/serviceAccountKey.json
   ```

## Step 6: Configure App Environment

1. In Firebase Console, go to **Project Settings** > **General**
2. Scroll to "Your apps" and select your Web app
3. Copy the configuration values
4. Create `zenvyGo/.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://your-server-url:3000/api/v1

   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

## Step 7: Configure Android for Phone Auth

Edit `zenvyGo/android/app/build.gradle` and add:

```gradle
apply plugin: 'com.google.gms.google-services'
```

Edit `zenvyGo/android/build.gradle` and add:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

## Step 8: Configure iOS for Phone Auth

1. Open `zenvyGo/ios/zenvyGo.xcworkspace` in Xcode
2. Add `GoogleService-Info.plist` to your project
3. Enable Push Notifications capability
4. Configure APNs authentication key in Firebase Console

## Step 9: Test the Integration

### Test Phone Numbers (Development)

For testing without sending real SMS:

1. Go to Firebase Console > **Authentication** > **Settings**
2. Scroll to "Phone numbers for testing"
3. Add test phone numbers with verification codes:
   - Phone: +1 650-555-1234
   - Code: 123456

### Test the Flow

1. Start the server:
   ```bash
   cd server
   pnpm dev
   ```

2. Start the app:
   ```bash
   cd zenvyGo
   npm start
   ```

3. In the app:
   - Enter a phone number
   - Receive OTP (via SMS or use test number)
   - Enter OTP code
   - Should successfully authenticate

## Security Considerations

### Server Security
- ✅ Keep `serviceAccountKey.json` secure and NEVER commit to git
- ✅ Add `serviceAccountKey.json` to `.gitignore`
- ✅ Use environment variables in production
- ✅ Verify Firebase ID tokens on every authenticated request
- ✅ Use HTTPS in production

### App Security
- ✅ Never hardcode API keys in code
- ✅ Use environment variables
- ✅ Enable App Check in Firebase to prevent abuse
- ✅ Implement rate limiting on the server

### Firebase Console Security
- ✅ Set up authorized domains
- ✅ Enable reCAPTCHA for web
- ✅ Configure usage quotas
- ✅ Set up billing alerts

## Troubleshooting

### "Invalid phone number"
- Ensure phone number includes country code (e.g., +971501234567)
- Check Firebase Console > Authentication > Settings > Authorized domains

### "Too many requests"
- Firebase has rate limits for phone authentication
- Use test phone numbers during development
- Implement exponential backoff

### "Network error"
- Check server URL in app `.env`
- Ensure server is running
- Check CORS settings on server

### "Invalid verification code"
- Codes expire after a few minutes
- Ensure correct code is entered
- Check Firebase Console logs

## API Endpoints

### POST `/api/v1/auth/firebase/verify`

Verify Firebase ID token and get app tokens.

**Request:**
```json
{
  "idToken": "firebase-id-token",
  "name": "User Name" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Firebase token verified",
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "user": {
      "id": "user-id",
      "name": "User Name",
      "language": "en",
      "country": "AE",
      "phoneLast4": "1234",
      "status": "active"
    }
  }
}
```

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│              │     │              │     │              │
│  React       │────▶│  Firebase    │────▶│   User's     │
│  Native App  │     │  Auth        │     │   Phone      │
│              │     │              │     │              │
└──────┬───────┘     └──────────────┘     └──────────────┘
       │                                           │
       │ 3. Enter OTP                             │
       │◀──────────────────────────────────────────┘
       │
       │ 4. Verify OTP with Firebase
       │    Get ID Token
       │
       │ 5. Send ID Token
       ▼
┌──────────────┐
│              │     6. Verify ID Token
│   Server     │────▶  with Firebase Admin SDK
│   (Node.js)  │
│              │     7. Issue App JWT Tokens
└──────────────┘
```

## Environment Variables Reference

### Server (.env)
```env
OTP_DRIVER=firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CREDENTIALS_PATH=/path/to/serviceAccountKey.json
# OR
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

### App (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

## Next Steps

1. ✅ Set up Firebase project
2. ✅ Configure server with Firebase Admin SDK
3. ✅ Configure app with Firebase SDK
4. ✅ Test with test phone numbers
5. ⬜ Add App Check for production
6. ⬜ Set up monitoring and alerts
7. ⬜ Configure production environment

## Support

For issues or questions:
- Check Firebase Authentication documentation
- Review server logs for detailed error messages
- Check app console for Firebase errors
- Verify all environment variables are set correctly
