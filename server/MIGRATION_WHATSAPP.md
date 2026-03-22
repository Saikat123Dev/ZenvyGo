# Migration to WhatsApp OTP Authentication

**Date:** March 20, 2026
**Status:** ✅ Completed

## Overview

Migrated OTP authentication from Firebase to WhatsApp Business API using Meta's Cloud API.

## Changes Made

### 1. New WhatsApp Service

**File:** `src/shared/services/whatsapp.service.ts`

- Implements WhatsApp Cloud API integration
- Handles OTP sending via message templates
- Includes error handling and logging
- Supports multiple languages (en, ar)

### 2. Updated Authentication Service

**File:** `src/modules/auth/auth.service.ts`

**Changes:**
- Removed Firebase Admin SDK import
- Added WhatsApp service import
- Updated `dispatchOtp()` method to use WhatsApp
- Deprecated `verifyFirebaseToken()` method (now throws error)
- Added language parameter support for WhatsApp

### 3. Environment Configuration

**File:** `src/shared/config/env.ts`

**Added:**
```typescript
OTP_DRIVER: z.enum(['mock', 'whatsapp', 'firebase', 'disabled'])
WHATSAPP_ACCESS_TOKEN: z.string().optional()
WHATSAPP_PHONE_NUMBER_ID: z.string().optional()
WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional()
WHATSAPP_API_VERSION: z.string().default('v21.0')
```

**Deprecated:**
- Firebase configuration variables (kept for backward compatibility)

### 4. Application Bootstrap

**File:** `src/app.ts`

**Changes:**
- Removed Firebase Admin initialization
- Removed Firebase Admin import

### 5. Dependencies

**Added:**
- `axios@^1.13.6` - HTTP client for WhatsApp API calls

**Kept (deprecated):**
- `firebase-admin@^13.7.0` - For backward compatibility only

### 6. Documentation

**New Files:**
- `WHATSAPP_SETUP.md` - Complete setup guide for WhatsApp Business API
- `scripts/verify-whatsapp.ts` - Verification script for testing setup
- `MIGRATION_WHATSAPP.md` - This file

**Updated Files:**
- `.env.example` - Updated with WhatsApp configuration

### 7. Scripts

**Added:**
```bash
pnpm verify:whatsapp  # Verify WhatsApp API credentials
```

## Breaking Changes

### ⚠️ Deprecated Endpoints

**Endpoint:** `POST /api/v1/auth/firebase/verify`

**Status:** Deprecated, returns error
**Error Message:** "Firebase authentication is deprecated. Please use WhatsApp OTP authentication instead."

**Recommended Action:** Update clients to use OTP flow:
1. `POST /api/v1/auth/otp/request` - Request OTP
2. `POST /api/v1/auth/otp/verify` - Verify OTP

### Environment Variables

**Required for WhatsApp:**
```env
OTP_DRIVER=whatsapp
WHATSAPP_ACCESS_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
```

**No longer required:**
```env
FIREBASE_PROJECT_ID
FIREBASE_CREDENTIALS_PATH
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

## Migration Steps for Existing Deployments

### 1. Set Up WhatsApp Business API

Follow the complete guide in `WHATSAPP_SETUP.md`:

1. Create Meta Developer account
2. Create Meta app with WhatsApp Business
3. Get access token, phone number ID, business account ID
4. Create and approve message template "otp_verification"
5. Add test phone numbers (for development)

### 2. Update Environment Variables

```bash
# Update .env file
OTP_DRIVER=whatsapp
WHATSAPP_ACCESS_TOKEN=your-permanent-access-token
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-id
WHATSAPP_API_VERSION=v21.0
```

### 3. Verify Setup

```bash
# Test WhatsApp configuration
pnpm verify:whatsapp

# Start development server
pnpm dev
```

### 4. Test OTP Flow

```bash
# Request OTP
curl -X POST http://localhost:3000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+971501234567",
    "country": "AE",
    "language": "en"
  }'

# You should receive WhatsApp message with OTP

# Verify OTP
curl -X POST http://localhost:3000/api/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+971501234567",
    "otp": "123456",
    "country": "AE",
    "language": "en"
  }'
```

### 5. Update Mobile Apps

If using Firebase on mobile apps, update to use OTP flow:

**Before (Firebase):**
```typescript
// Send OTP via Firebase
const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
const idToken = await auth().currentUser.getIdToken();

// Verify with backend
await api.post('/auth/firebase/verify', { idToken, name });
```

**After (WhatsApp OTP):**
```typescript
// Request OTP from backend
await api.post('/auth/otp/request', {
  phone: phoneNumber,
  country: 'AE',
  language: 'en'
});

// User receives WhatsApp message
// User enters OTP in your app UI

// Verify OTP with backend
await api.post('/auth/otp/verify', {
  phone: phoneNumber,
  otp: enteredOtp,
  country: 'AE',
  language: 'en'
});
```

## Rollback Plan

If issues arise with WhatsApp:

### Option 1: Temporary Rollback to Mock

```env
# Set in .env
OTP_DRIVER=mock
```

This will log OTPs in server logs for development/testing.

### Option 2: Keep Old Code (Not Recommended)

The Firebase Admin code is still in the codebase but inactive. To reactivate:

1. Update `src/app.ts` to re-add Firebase initialization
2. Update `src/modules/auth/auth.service.ts` to restore `verifyFirebaseToken()` logic
3. Set `OTP_DRIVER=firebase` in `.env`

**Note:** Not recommended as Firebase OTP is client-side, not server-side.

## Benefits of WhatsApp OTP

✅ **Better UX:** Users receive OTP directly in WhatsApp
✅ **Higher Delivery Rate:** WhatsApp has ~98% delivery rate
✅ **Lower Cost:** Free tier includes 1,000 conversations/month
✅ **Multi-language:** Easy to support multiple languages
✅ **Official Business:** Verified business account badge
✅ **Rich Messaging:** Can add buttons, formatting in messages
✅ **Analytics:** Built-in analytics in Meta Business Suite

## Known Limitations

⚠️ **Template Approval:** Takes 24-48 hours for new templates
⚠️ **Rate Limits:** Free tier limited to 1,000 conversations/month
⚠️ **Test Numbers:** Must pre-register test numbers in development
⚠️ **Business Verification:** Required for production use

## Support & Troubleshooting

- Check `WHATSAPP_SETUP.md` for detailed troubleshooting
- Run `pnpm verify:whatsapp` to test configuration
- Check server logs for detailed error messages
- Review [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)

## Security Notes

🔒 **Access tokens should never be committed to git**
🔒 **Use System User tokens for production (permanent)**
🔒 **Rotate tokens regularly**
🔒 **Monitor usage in Meta Business Suite**
🔒 **Set up billing alerts to avoid unexpected charges**

## Next Steps

1. ✅ Complete WhatsApp Business API setup
2. ✅ Approve message template
3. ⏳ Test with multiple phone numbers
4. ⏳ Update mobile app clients
5. ⏳ Set up monitoring and alerts
6. ⏳ Configure webhooks for delivery status (optional)
7. ⏳ Remove deprecated Firebase endpoint after full migration

---

**Questions?** Check `WHATSAPP_SETUP.md` or contact the development team.
