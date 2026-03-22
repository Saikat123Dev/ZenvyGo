# Vehicle Contact App - Implementation Guide

## How to Use This Guide

This guide provides step-by-step instructions with AI prompts to build the entire app. Copy each prompt into Claude/ChatGPT to generate the code for that component.

---

# PHASE 1: PROJECT SETUP

## Step 1.1: Initialize Backend Project

**AI Prompt:**
```
Create a Node.js backend project structure for a vehicle contact API with:

1. Initialize with TypeScript, Express, and these dependencies:
   - express, cors, helmet
   - pg (PostgreSQL), redis
   - jsonwebtoken, bcrypt
   - zod (validation)
   - winston (logging)
   - dotenv

2. Create this folder structure:
   src/
   ├── config/
   │   ├── database.ts
   │   ├── redis.ts
   │   └── env.ts
   ├── modules/
   │   ├── auth/
   │   ├── vehicles/
   │   ├── tags/
   │   └── contact/
   ├── middlewares/
   │   ├── authenticate.ts
   │   ├── rateLimit.ts
   │   └── errorHandler.ts
   ├── utils/
   │   ├── logger.ts
   │   └── response.ts
   └── app.ts

3. Set up Express app with:
   - CORS configured for mobile apps
   - Helmet for security headers
   - JSON body parser
   - Request logging
   - Global error handler

4. Create .env.example with required variables

Provide complete code for each file.
```

---

## Step 1.2: Initialize Mobile App Project

**AI Prompt:**
```
Create a React Native Expo project for a vehicle contact app with:

1. Initialize using: npx create-expo-app@latest vehicle-app -t expo-template-blank-typescript

2. Install these dependencies:
   - expo-router (file-based routing)
   - @tanstack/react-query (server state)
   - zustand (app state)
   - expo-secure-store (secure storage)
   - react-i18next, i18next
   - expo-camera, expo-barcode-scanner
   - expo-notifications
   - react-hook-form, zod
   - nativewind (Tailwind for React Native)

3. Create this folder structure:
   src/
   ├── app/
   │   ├── (auth)/
   │   │   ├── _layout.tsx
   │   │   ├── login.tsx
   │   │   └── otp.tsx
   │   ├── (main)/
   │   │   ├── _layout.tsx
   │   │   ├── index.tsx
   │   │   ├── vehicles/
   │   │   ├── scan.tsx
   │   │   ├── alerts.tsx
   │   │   └── profile.tsx
   │   └── _layout.tsx
   ├── components/
   ├── services/
   ├── stores/
   ├── hooks/
   ├── i18n/
   └── config/

4. Configure:
   - Expo Router with auth/main groups
   - NativeWind/Tailwind
   - React Query provider
   - i18next with English and Arabic

Provide the app.json, babel.config.js, and root _layout.tsx files.
```

---

## Step 1.3: Database Setup

**AI Prompt:**
```
Create PostgreSQL database setup for a vehicle contact app:

1. Create a migration system using node-pg-migrate

2. Create migration files for these tables with proper indexes:
   - users (id, phone_ref, name, language, country, status, timestamps)
   - vehicles (id, owner_id FK, plate_number, make, model, color, status, timestamps)
   - tags (id, token UNIQUE, vehicle_id FK, type, state, timestamps)
   - contact_sessions (id, vehicle_id FK, tag_id FK, reason_code, channel, status, caller_context JSONB, timestamps)
   - alerts (id, user_id FK, session_id FK, title, body, severity, read, timestamps)
   - emergency_profiles (id, vehicle_id FK UNIQUE, contacts JSONB, medical_notes, timestamps)

3. Create a seed file with sample data for development

4. Create database connection pool with:
   - Connection pooling (max 20 connections)
   - SSL support for production
   - Query logging in development

Provide complete SQL migrations and TypeScript connection code.
```

---

# PHASE 2: AUTHENTICATION MODULE

## Step 2.1: OTP Service

**AI Prompt:**
```
Create an OTP authentication service in Node.js/TypeScript:

1. OTP generation and verification:
   - Generate 6-digit OTP
   - Store in Redis with 5-minute TTL
   - Max 3 attempts before lockout
   - 15-minute lockout after max attempts
   - Rate limit: 5 OTP requests per phone per 15 minutes

2. PII Vault integration:
   - Store phone numbers encrypted (AES-256-GCM)
   - Return vault reference key instead of raw phone
   - Decrypt only when needed for Firebase verification

3. Firebase Phone Authentication:
   - Client-side OTP sending via Firebase SDK
   - Server-side ID token verification
   - Automatic SMS delivery by Firebase
   - Support for international numbers

4. API endpoints:
   POST /api/v1/auth/otp/request
   - Input: { phone: "+971...", country: "AE" }
   - Validate phone format per country
   - Generate and send OTP
   - Response: { success: true, expires_in: 300 }

   POST /api/v1/auth/otp/verify
   - Input: { phone: "+971...", otp: "123456" }
   - Verify OTP
   - Create/get user
   - Generate JWT tokens (access + refresh)
   - Response: { access_token, refresh_token, user }

5. JWT token management:
   - Access token: 1 hour expiry
   - Refresh token: 30 days expiry
   - Include user_id, country, language in payload

Provide complete TypeScript code with Zod validation schemas.
```

---

## Step 2.2: Auth Middleware

**AI Prompt:**
```
Create authentication middleware for Express in TypeScript:

1. JWT verification middleware:
   - Extract token from Authorization header (Bearer scheme)
   - Verify token signature and expiry
   - Attach user to request object
   - Handle expired tokens with specific error code

2. Refresh token endpoint:
   POST /api/v1/auth/refresh
   - Validate refresh token
   - Issue new access token
   - Optionally rotate refresh token

3. TypeScript types:
   - Extend Express Request type with user
   - Create AuthenticatedRequest interface

4. Error responses:
   - 401 for missing/invalid token
   - 401 with code "TOKEN_EXPIRED" for expired tokens
   - Consistent error format

Provide complete middleware code with types.
```

---

## Step 2.3: Mobile Auth Screens

**AI Prompt:**
```
Create authentication screens for React Native with Expo Router:

1. Login Screen (app/(auth)/login.tsx):
   - Country selector dropdown (UAE, Saudi, Qatar)
   - Phone number input with country code
   - Validate phone format
   - "Get OTP" button
   - Loading state during API call
   - Navigate to OTP screen on success
   - RTL support for Arabic

2. OTP Screen (app/(auth)/otp.tsx):
   - Display masked phone number
   - 6 individual digit inputs with auto-focus
   - Auto-submit when 6 digits entered
   - Resend OTP button (with 60s cooldown timer)
   - Loading state during verification
   - Navigate to main app on success
   - Store tokens in SecureStore

3. Auth Layout (app/(auth)/_layout.tsx):
   - Stack navigator
   - Check for existing token on mount
   - Redirect to main if already logged in

4. Use:
   - react-hook-form for form state
   - Zod for validation
   - TanStack Query for API calls
   - Zustand for auth state

Provide complete TypeScript code with proper styling.
```

---

# PHASE 3: VEHICLE MODULE

## Step 3.1: Vehicle Service (Backend)

**AI Prompt:**
```
Create a vehicle management service in Node.js/TypeScript:

1. Vehicle CRUD operations:

   GET /api/v1/vehicles
   - List all vehicles for authenticated user
   - Include associated tags
   - Pagination support

   POST /api/v1/vehicles
   - Create new vehicle
   - Validate plate format per country (UAE, Saudi, Qatar formats)
   - Auto-generate eTag on creation
   - Max 3 vehicles for free users, 10 for premium

   GET /api/v1/vehicles/:id
   - Get single vehicle with tags and emergency profile
   - Verify ownership

   PATCH /api/v1/vehicles/:id
   - Update vehicle details
   - Verify ownership

   DELETE /api/v1/vehicles/:id
   - Soft delete (set status to 'archived')
   - Deactivate associated tags
   - Verify ownership

2. Plate number validation:
   - UAE format: A 12345 or 12345 A (Emirate codes)
   - Saudi format: ABC 1234 (Arabic letters)
   - Qatar format: 123456

3. Database queries using parameterized queries (prevent SQL injection)

4. Include Zod schemas for all inputs

Provide complete TypeScript code with proper error handling.
```

---

## Step 3.2: Vehicle Screens (Mobile)

**AI Prompt:**
```
Create vehicle management screens for React Native:

1. Vehicle List Screen (app/(main)/vehicles/index.tsx):
   - Fetch vehicles using TanStack Query
   - Display as cards: plate, make/model, color, tag status
   - Pull-to-refresh
   - Empty state with "Add Vehicle" CTA
   - FAB button to add new vehicle
   - Swipe to delete (with confirmation)

2. Add/Edit Vehicle Screen (app/(main)/vehicles/[id].tsx):
   - Form with fields: plate_number, make, model, color, year
   - Country-specific plate input formatting
   - Dropdown for make (Toyota, Nissan, Honda, etc.)
   - Color picker
   - Save button with loading state
   - Delete button (edit mode only)

3. Vehicle Detail Screen (app/(main)/vehicles/detail/[id].tsx):
   - Display all vehicle info
   - Show active tag with QR code
   - "Download eTag PDF" button
   - Emergency profile section
   - Recent alerts for this vehicle
   - Edit button in header

4. Use:
   - react-hook-form with Zod validation
   - TanStack Query mutations
   - Optimistic updates on edit/delete
   - Proper loading and error states

Provide complete TypeScript code with NativeWind styling.
```

---

# PHASE 4: TAG & QR MODULE

## Step 4.1: Tag Service (Backend)

**AI Prompt:**
```
Create a tag management service in Node.js/TypeScript:

1. Tag generation:

   POST /api/v1/tags/generate
   - Generate unique opaque token (32 chars, URL-safe)
   - Create tag record linked to vehicle
   - Return tag data and QR code URL

   Token format: base64url encoded random bytes
   QR URL format: https://app.sampark.ae/t/{token}

2. Tag resolution (PUBLIC - no auth required):

   POST /api/v1/tags/resolve
   - Input: { token: "abc123..." }
   - Lookup tag by token
   - Verify tag is active
   - Return: vehicle_id (not full details), available channels, reason codes
   - Rate limit: 20 requests per IP per hour
   - DO NOT return owner phone or sensitive data

3. Tag activation:

   POST /api/v1/vehicles/:id/activate-tag
   - Activate tag for vehicle
   - Deactivate any previous active tag
   - Only one active tag per vehicle

4. Tag states: unassigned → assigned → activated → suspended → retired

5. QR Code generation:
   - Use 'qrcode' npm package
   - Generate PNG and SVG formats
   - Include app logo in center
   - Return as base64 or upload to S3

Provide complete TypeScript code.
```

---

## Step 4.2: QR Scanner Screen (Mobile)

**AI Prompt:**
```
Create a QR scanner screen for React Native with Expo:

1. Scanner Screen (app/(main)/scan.tsx):
   - Use expo-camera or expo-barcode-scanner
   - Request camera permission with explanation
   - Full-screen camera view with scan overlay
   - Vibrate on successful scan
   - Parse QR data and extract token
   - Call /tags/resolve API
   - Navigate to contact screen with vehicle data

2. Permission denied state:
   - Explanation why camera is needed
   - Button to open settings

3. Scan overlay UI:
   - Transparent overlay with cutout in center
   - Corner markers for scan area
   - "Scan QR code on vehicle" instruction
   - Flashlight toggle button

4. Contact Screen (app/(main)/contact/[sessionId].tsx):
   - Display vehicle info (plate, make/model)
   - Reason code selector (radio buttons):
     - Blocking access
     - Lights on
     - Window open
     - Towing risk
     - Accident
     - Security concern
   - Channel selector (if multiple available):
     - Call
     - Message
     - WhatsApp
   - "Contact Owner" button
   - Loading state while connecting

5. Handle deep links:
   - Handle https://app.sampark.ae/t/{token} URLs
   - Auto-resolve and show contact screen

Provide complete TypeScript code with proper UX.
```

---

# PHASE 5: MASKED COMMUNICATION

## Step 5.1: Contact Session Service (Backend)

**AI Prompt:**
```
Create a contact session service in Node.js/TypeScript:

1. Session creation:

   POST /api/v1/contact-sessions
   Input: {
     tag_token: "abc123",
     reason_code: "blocking_access",
     channel: "voice",
     caller_context: { device_id, app_version, location_city }
   }

   - Resolve tag to vehicle
   - Check rate limits (max 3 sessions per vehicle per day)
   - Create session with 30-minute TTL
   - Return session_id and status

2. Session states:
   initiated → connecting → connected → completed
                         → missed → (send notification)
                         → failed

3. Rate limiting:
   - Per IP: 10 sessions per hour
   - Per vehicle: 5 sessions per day
   - Per caller phone: 3 sessions per vehicle per day

4. Cleanup job:
   - Expire sessions after TTL
   - Release any allocated resources

5. Session status endpoint:
   GET /api/v1/contact-sessions/:id/status
   - Return current status, duration if connected

Provide complete TypeScript code with Redis for rate limiting.
```

---

## Step 5.2: Voice Call Integration (Telnyx)

**AI Prompt:**
```
Create Telnyx voice call integration in Node.js/TypeScript:

1. Virtual number pool management:
   - Maintain pool of 50+ virtual numbers in Redis
   - Allocate number from pool for session
   - Release back to pool after session ends
   - Track number-to-session mapping

2. Telnyx setup:
   - Install: npm install telnyx
   - Configure with API key and Connection ID
   - Purchase phone numbers via Mission Control portal

3. Voice call initiation:

   POST /api/v1/contact-sessions/:id/call

   Flow:
   a. Allocate 2 virtual numbers (caller-side, owner-side)
   b. Call bystander using Telnyx Call Control API
   c. When bystander answers, play message, then call owner
   d. When owner answers, bridge both calls using conference
   e. Neither party sees real number

4. Telnyx Call Control API:

   // Create outbound call
   const telnyx = require('telnyx')(TELNYX_API_KEY);

   const call = await telnyx.calls.create({
     connection_id: TELNYX_CONNECTION_ID,
     to: phoneNumber,
     from: virtualNumber,
     webhook_url: `${BACKEND_URL}/webhooks/telnyx/call-events`,
     webhook_url_method: 'POST'
   });

5. Webhook handlers:

   POST /webhooks/telnyx/call-events
   Handle events:
   - call.initiated: Call started
   - call.answered: Party picked up → bridge calls
   - call.hangup: Call ended → release numbers
   - call.machine.detection.ended: Voicemail → send SMS fallback

6. Call bridging with conference:

   // When both parties answer, join them to conference
   await telnyx.calls.conference({
     call_control_id: bystanderCallId,
     conference_id: `session-${sessionId}`
   });

   await telnyx.calls.conference({
     call_control_id: ownerCallId,
     conference_id: `session-${sessionId}`
   });

7. Handle owner not answering:
   - After 30s timeout, hangup bystander call
   - Send push notification to owner
   - Update session status to 'missed'

8. Text-to-speech with Telnyx:

   await telnyx.calls.speak({
     call_control_id: callId,
     payload: 'Connecting you to the vehicle owner. Please wait.',
     voice: 'female',
     language: 'en-US'
   });

Provide complete TypeScript code with Telnyx SDK.
```

---

## Step 5.3: SMS & WhatsApp Integration (Telnyx + Meta Cloud API)

**AI Prompt:**
```
Create SMS (Telnyx) and WhatsApp (Meta Cloud API) integration in Node.js/TypeScript:

## PART 1: SMS via Telnyx

1. SMS sending:

   POST /api/v1/contact-sessions/:id/message
   Input: { message: "Your car is blocking..." }

   const telnyx = require('telnyx')(TELNYX_API_KEY);

   const sms = await telnyx.messages.create({
     from: TELNYX_PHONE_NUMBER,  // Your purchased number
     to: ownerPhone,
     text: `Vehicle Alert: ${reasonCode}\nVehicle: ****${plateLast4}\nMessage: ${userMessage}\nRespond: ${appDeepLink}`
   });

2. SMS webhook for delivery status:

   POST /webhooks/telnyx/message-events
   Handle events:
   - message.sent
   - message.delivered
   - message.failed → Fallback to push notification

## PART 2: WhatsApp via Meta Cloud API (Direct Integration)

1. Setup requirements:
   - Meta Business Account (business.facebook.com)
   - WhatsApp Business Account
   - Verified phone number
   - Approved message templates

2. Send template message:

   const axios = require('axios');

   async function sendWhatsAppAlert(sessionId, ownerPhone, ownerName, plate, reason) {
     const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

     const response = await axios.post(WHATSAPP_API_URL, {
       messaging_product: 'whatsapp',
       to: ownerPhone.replace('+', ''),
       type: 'template',
       template: {
         name: 'vehicle_contact_alert',
         language: { code: 'en' },
         components: [
           {
             type: 'body',
             parameters: [
               { type: 'text', text: ownerName },
               { type: 'text', text: plate },
               { type: 'text', text: reason }
             ]
           }
         ]
       }
     }, {
       headers: {
         'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
         'Content-Type': 'application/json'
       }
     });

     return response.data;
   }

3. WhatsApp webhook setup:

   // Verification endpoint (required by Meta)
   GET /webhooks/whatsapp
   - Verify hub.verify_token matches your token
   - Return hub.challenge

   // Message events
   POST /webhooks/whatsapp
   Handle:
   - messages: Incoming replies from owner
   - statuses: sent, delivered, read, failed

4. Message template to create in Meta Business Suite:

   Template name: vehicle_contact_alert
   Category: UTILITY
   Language: English

   Body:
   "Hello {{1}},

   Someone needs to contact you about your vehicle ({{2}}).

   Reason: {{3}}

   Tap below to respond."

   Button: Quick Reply or URL button

## PART 3: Channel Selection Logic

async function selectChannel(session, owner) {
  // Emergency = always voice
  if (['accident', 'security_concern'].includes(session.reason_code)) {
    return 'voice';
  }

  // Quiet hours = messaging only
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 7) {
    return owner.has_whatsapp ? 'whatsapp' : 'sms';
  }

  // Default to owner preference
  return owner.preferred_channel || 'voice';
}

Provide complete TypeScript code for both Telnyx SMS and WhatsApp Cloud API.
```

---

# PHASE 6: NOTIFICATIONS

## Step 6.1: Push Notification Service

**AI Prompt:**
```
Create push notification service in Node.js/TypeScript:

1. Device token management:

   POST /api/v1/devices/register
   Input: { token: "fcm_or_apns_token", platform: "android|ios" }

   - Store device token linked to user
   - Support multiple devices per user
   - Update token if already exists

2. Send notification function:

   async function sendPushNotification(userId, notification) {
     // Get all device tokens for user
     // Send via FCM (Firebase Cloud Messaging)
     // Handle token expiry/invalid tokens
   }

3. Notification types:
   - CONTACT_REQUEST: "Someone needs to contact you about your vehicle"
   - MISSED_CONTACT: "You missed a contact attempt"
   - SESSION_RESOLVED: "Contact session completed"

4. FCM integration:
   - Use firebase-admin SDK
   - Support data-only and notification messages
   - Include deep link to session screen

5. Notification payload:
   {
     title: "Vehicle Alert",
     body: "Someone needs to contact you",
     data: {
       type: "CONTACT_REQUEST",
       session_id: "uuid",
       deep_link: "sampark://session/uuid"
     }
   }

Provide complete TypeScript code.
```

---

## Step 6.2: Mobile Notification Setup

**AI Prompt:**
```
Set up push notifications in React Native with Expo:

1. Notification configuration (services/notifications.ts):
   - Configure expo-notifications
   - Request notification permissions
   - Get Expo push token or FCM token
   - Register token with backend
   - Handle token refresh

2. Notification handlers:
   - Handle notification received while app is open
   - Handle notification tap (background/killed)
   - Navigate to appropriate screen based on type

3. Notification listener setup (_layout.tsx):
   - Set up listeners on app mount
   - Handle deep links from notifications
   - Update notification badge count

4. Alert screen (app/(main)/alerts.tsx):
   - List all notifications/alerts
   - Mark as read on view
   - Pull-to-refresh
   - Tap to navigate to session details
   - Clear all button

5. Badge management:
   - Update app icon badge with unread count
   - Clear badge when alerts screen viewed

Provide complete TypeScript code.
```

---

# PHASE 7: PAYMENTS (STRIPE)

## Step 7.1: Stripe Integration (Backend)

**AI Prompt:**
```
Create Stripe payment integration in Node.js/TypeScript:

1. Product/Price setup:
   - Create products in Stripe dashboard:
     - Premium Monthly (AED 29)
     - Premium Annual (AED 290)
     - Family Monthly (AED 49)
     - Family Annual (AED 490)

2. Checkout session:

   POST /api/v1/payments/create-checkout
   Input: { price_id: "price_xxx", success_url, cancel_url }

   - Create Stripe Checkout Session
   - Return session URL for redirect

3. Webhooks:

   POST /webhooks/stripe

   Handle events:
   - checkout.session.completed → Activate subscription
   - invoice.paid → Record payment
   - invoice.payment_failed → Send reminder, grace period
   - customer.subscription.deleted → Downgrade to free

4. Subscription management:

   GET /api/v1/subscriptions/current
   - Return current plan, status, renewal date

   POST /api/v1/subscriptions/cancel
   - Cancel at period end

   POST /api/v1/subscriptions/portal
   - Create Stripe Customer Portal session
   - Return URL for user to manage subscription

5. Entitlement checks:
   - Middleware to check subscription status
   - Feature flags based on plan

Provide complete TypeScript code with Stripe SDK.
```

---

## Step 7.2: Payment Screens (Mobile)

**AI Prompt:**
```
Create payment/subscription screens in React Native:

1. Subscription Screen (app/(main)/profile/subscription.tsx):
   - Show current plan (Free/Premium/Family)
   - Show renewal date if subscribed
   - Plan comparison table
   - "Upgrade" button for each paid plan
   - Open Stripe Checkout in WebView or browser

2. Plan comparison component:
   - Free: 1 vehicle, 5 calls/month
   - Premium: 3 vehicles, unlimited calls, WhatsApp
   - Family: 10 vehicles, 5 members

3. Checkout flow:
   - Call backend to create checkout session
   - Open session.url in expo-web-browser
   - Handle success/cancel redirect
   - Refresh subscription status

4. Success screen:
   - "Welcome to Premium!" message
   - List of unlocked features
   - "Start exploring" button

5. Manage subscription:
   - "Manage Subscription" button
   - Opens Stripe Customer Portal
   - User can cancel, update payment method

Provide complete TypeScript code.
```

---

# PHASE 8: TESTING & DEPLOYMENT

## Step 8.1: Backend Testing

**AI Prompt:**
```
Create comprehensive tests for the vehicle contact API:

1. Test setup:
   - Use Jest with TypeScript
   - Create test database (separate from dev)
   - Seed test data before each test
   - Clean up after each test

2. Unit tests for:
   - OTP generation and validation
   - JWT token creation and verification
   - Phone number validation per country
   - Rate limiting logic

3. Integration tests for:
   - Auth flow: request OTP → verify → get tokens
   - Vehicle CRUD: create → read → update → delete
   - Tag resolution: generate → activate → resolve
   - Contact session: create → update status

4. API tests using supertest:
   - Test all endpoints
   - Test authentication required endpoints
   - Test rate limits
   - Test validation errors

5. Mock external services:
   - Mock Firebase for OTP in tests
   - Mock Stripe for payments
   - Mock Redis for rate limiting tests

Provide complete test files with good coverage.
```

---

## Step 8.2: Mobile Testing

**AI Prompt:**
```
Create tests for the React Native app:

1. Test setup:
   - Use Jest with React Native Testing Library
   - Mock AsyncStorage and SecureStore
   - Mock navigation
   - Mock TanStack Query

2. Component tests:
   - Login screen: form validation, submit button states
   - Vehicle card: renders correctly, actions work
   - QR scanner: permission states, scan handling

3. Hook tests:
   - useAuth: login, logout, token refresh
   - useVehicles: CRUD operations, optimistic updates

4. Integration tests:
   - Auth flow: login → OTP → main app
   - Add vehicle flow: form → submit → list update

5. E2E tests with Detox (optional):
   - Full user journey
   - Real device testing

Provide test configuration and sample tests.
```

---

## Step 8.3: Deployment Scripts

**AI Prompt:**
```
Create deployment configuration for the vehicle contact app:

1. Docker setup:
   - Dockerfile for Node.js backend
   - docker-compose.yml for local development
     - API service
     - PostgreSQL
     - Redis
   - .dockerignore file

2. GitHub Actions CI/CD:
   - .github/workflows/ci.yml
     - Run tests on PR
     - Lint code
     - Type check
   - .github/workflows/deploy.yml
     - Build Docker image
     - Push to ECR
     - Deploy to ECS

3. Environment configuration:
   - .env.example with all variables
   - Document required secrets for CI/CD

4. Database migrations:
   - Run migrations in CI before deployment
   - Rollback strategy

5. Mobile deployment:
   - EAS Build configuration (eas.json)
   - App store submission checklist
   - OTA update configuration

Provide all configuration files.
```

---

# QUICK REFERENCE: ALL AI PROMPTS

## Backend Prompts Order:
1. Project setup
2. Database setup
3. Auth service (Firebase Phone Auth)
4. Auth middleware
5. Vehicle service
6. Tag service
7. Contact session service
8. Voice calling integration (Telnyx)
9. SMS/WhatsApp integration
10. Push notification service
11. Stripe integration
12. Testing
13. Deployment

## Mobile Prompts Order:
1. Project setup
2. Auth screens
3. Vehicle screens
4. QR scanner
5. Contact screen
6. Notification setup
7. Payment screens
8. Testing

---

# TIPS FOR WORKING WITH AI

1. **Be specific**: Include exact field names, validation rules, and error messages

2. **Provide context**: Reference this document when asking follow-up questions

3. **Iterate**: If output isn't right, ask to modify specific parts

4. **Test incrementally**: Build and test each module before moving to next

5. **Ask for explanations**: If code is unclear, ask AI to explain the logic

6. **Request alternatives**: Ask for different approaches if you want options

Example follow-up prompts:
- "Add Arabic validation error messages to the auth service"
- "Modify the vehicle service to support pagination with cursor"
- "Add unit tests for the OTP service"
- "Optimize the database queries with proper indexes"
