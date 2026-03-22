# Vehicle Contact App - Development Checklist

## Pre-Development Setup

### Accounts Required
- [ ] AWS Account (or preferred cloud provider)
- [ ] Telnyx Account (for voice/SMS) - telnyx.com
- [ ] Meta Business Account (for WhatsApp Cloud API)
- [ ] Stripe Account (for payments)
- [ ] Apple Developer Account ($99/year)
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Firebase Project (for FCM push notifications)
- [ ] Expo Account (for EAS builds)

### API Keys to Obtain
- [ ] Telnyx API Key and Public Key
- [ ] Telnyx Connection ID (from Mission Control)
- [ ] Telnyx Phone Numbers (purchase 50+ for UAE)
- [ ] WhatsApp Phone Number ID and Access Token
- [ ] Stripe Secret Key and Publishable Key
- [ ] Firebase Service Account JSON
- [ ] Expo Access Token

### Telnyx Setup Steps
1. Create account at telnyx.com
2. Complete KYC verification
3. Create a "Connection" (Call Control Application)
4. Purchase phone numbers for UAE/Middle East
5. Configure webhook URLs in Mission Control
6. Enable messaging on your numbers

### WhatsApp Cloud API Setup Steps
1. Create Meta Business Account (business.facebook.com)
2. Create WhatsApp Business Account
3. Add and verify a phone number
4. Create message templates in WhatsApp Manager
5. Submit templates for approval (24-72 hours)
6. Generate permanent access token
7. Configure webhook URL

---

## Phase 1: Foundation (Week 1-2)

### Backend Setup
- [ ] Initialize Node.js/TypeScript project
- [ ] Set up Express with middleware
- [ ] Configure PostgreSQL connection
- [ ] Configure Redis connection
- [ ] Set up database migrations
- [ ] Run initial migrations
- [ ] Set up logging (Winston)
- [ ] Set up error handling

### Mobile Setup
- [ ] Initialize Expo project
- [ ] Configure Expo Router
- [ ] Set up NativeWind/Tailwind
- [ ] Configure i18n (English + Arabic)
- [ ] Set up Zustand stores
- [ ] Set up TanStack Query
- [ ] Create API client service

---

## Phase 2: Authentication (Week 2-3)

### Backend
- [ ] Create users table migration
- [ ] Implement PII vault (encrypted phone storage)
- [ ] Implement OTP generation (Redis)
- [ ] Implement OTP verification
- [ ] Implement JWT token issuance
- [ ] Implement refresh token flow
- [ ] Add rate limiting for auth endpoints
- [ ] Integrate Telnyx for SMS OTP

### Mobile
- [ ] Create login screen
- [ ] Create OTP verification screen
- [ ] Implement phone validation (country-specific)
- [ ] Store tokens in SecureStore
- [ ] Implement auth state management
- [ ] Add biometric unlock (optional)
- [ ] Handle token refresh

### Test
- [ ] OTP request works
- [ ] OTP verify works
- [ ] Token refresh works
- [ ] Rate limiting triggers correctly

---

## Phase 3: Vehicle Management (Week 3-4)

### Backend
- [ ] Create vehicles table migration
- [ ] Implement vehicle CRUD endpoints
- [ ] Add plate number validation per country
- [ ] Add ownership verification middleware
- [ ] Implement vehicle soft delete

### Mobile
- [ ] Create vehicle list screen
- [ ] Create add vehicle form
- [ ] Create edit vehicle screen
- [ ] Create vehicle detail screen
- [ ] Implement pull-to-refresh
- [ ] Add optimistic updates

### Test
- [ ] Create vehicle works
- [ ] List vehicles shows correct data
- [ ] Edit vehicle updates correctly
- [ ] Delete vehicle soft-deletes

---

## Phase 4: Tag & QR System (Week 4-5)

### Backend
- [ ] Create tags table migration
- [ ] Implement tag generation (opaque tokens)
- [ ] Implement tag resolution endpoint (PUBLIC)
- [ ] Implement tag activation
- [ ] Generate QR code images
- [ ] Add rate limiting for tag resolution

### Mobile
- [ ] Implement QR scanner screen
- [ ] Request camera permissions
- [ ] Parse QR data and resolve tags
- [ ] Handle deep links (https://app.sampark.ae/t/xxx)
- [ ] Create downloadable eTag PDF

### Test
- [ ] Tag generation creates unique tokens
- [ ] QR scan resolves to correct vehicle
- [ ] Deep links work from browser
- [ ] Rate limiting works on resolve

---

## Phase 5: Contact Sessions (Week 5-6)

### Backend
- [ ] Create contact_sessions table migration
- [ ] Implement session creation
- [ ] Add reason codes configuration
- [ ] Set up session TTL (30 min)
- [ ] Add session rate limiting
- [ ] Implement session status tracking

### Mobile
- [ ] Create contact initiation screen
- [ ] Display reason code selector
- [ ] Display channel selector
- [ ] Show session status updates
- [ ] Handle session expiry

### Test
- [ ] Sessions create correctly
- [ ] Rate limiting prevents abuse
- [ ] Session expires after TTL

---

## Phase 6: Masked Communication (Week 6-8)

### Voice Calls (Telnyx)
- [ ] Set up Telnyx virtual number pool in Redis
- [ ] Implement number allocation/release
- [ ] Create Call Control webhook endpoints
- [ ] Implement call bridging with conference
- [ ] Handle call status events (initiated, answered, hangup)
- [ ] Implement text-to-speech announcements
- [ ] Implement missed call notifications

### SMS (Telnyx)
- [ ] Configure Telnyx messaging on numbers
- [ ] Implement SMS sending via Telnyx API
- [ ] Create message templates
- [ ] Handle delivery status webhooks

### WhatsApp (Meta Cloud API)
- [ ] Create and approve message templates
- [ ] Implement template message sending
- [ ] Set up webhook verification endpoint
- [ ] Handle incoming message webhooks
- [ ] Handle delivery status updates

### Test
- [ ] Voice call connects both parties
- [ ] Neither party sees real number
- [ ] SMS delivers correctly
- [ ] WhatsApp template sends successfully
- [ ] Missed calls trigger notifications

---

## Phase 7: Notifications (Week 8-9)

### Backend
- [ ] Set up Firebase Admin SDK
- [ ] Create device tokens table
- [ ] Implement device registration endpoint
- [ ] Implement send notification function
- [ ] Create notification templates

### Mobile
- [ ] Configure expo-notifications
- [ ] Request notification permissions
- [ ] Register device token with backend
- [ ] Handle foreground notifications
- [ ] Handle notification taps
- [ ] Create alerts list screen

### Test
- [ ] Notifications deliver on contact request
- [ ] Tapping notification opens correct screen
- [ ] Badge count updates correctly

---

## Phase 8: Payments (Week 9-10)

### Backend
- [ ] Create Stripe products and prices
- [ ] Implement checkout session creation
- [ ] Set up Stripe webhooks
- [ ] Handle subscription lifecycle events
- [ ] Implement entitlement checks

### Mobile
- [ ] Create subscription screen
- [ ] Show plan comparison
- [ ] Open Stripe Checkout
- [ ] Handle success/cancel redirects
- [ ] Show current subscription status

### Test
- [ ] Checkout flow completes
- [ ] Subscription activates on payment
- [ ] Features unlock for paid users
- [ ] Subscription cancellation works

---

## Phase 9: Testing & Polish (Week 10-11)

### Backend Testing
- [ ] Unit tests for services
- [ ] Integration tests for API
- [ ] Load testing for key endpoints
- [ ] Security audit

### Mobile Testing
- [ ] Component tests
- [ ] E2E tests (critical flows)
- [ ] Test on real devices (iOS + Android)
- [ ] Test RTL layout (Arabic)

### Polish
- [ ] Error messages in Arabic
- [ ] Loading states everywhere
- [ ] Empty states with CTAs
- [ ] Offline handling
- [ ] App icon and splash screen

---

## Phase 10: Deployment (Week 11-12)

### Backend
- [ ] Create production Dockerfile
- [ ] Set up CI/CD pipeline
- [ ] Deploy to AWS (ECS/EC2)
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Configure monitoring (CloudWatch)
- [ ] Set up alerts

### Mobile
- [ ] Configure EAS Build
- [ ] Create production build
- [ ] Submit to App Store
- [ ] Submit to Play Store
- [ ] Set up OTA updates

### Post-Launch
- [ ] Monitor error rates
- [ ] Monitor API latency
- [ ] Track key metrics
- [ ] Gather user feedback

---

## Key Files Reference

```
/backend
├── src/
│   ├── modules/
│   │   ├── auth/         # OTP, JWT, middleware
│   │   ├── vehicles/     # Vehicle CRUD
│   │   ├── tags/         # Tag generation, resolution
│   │   ├── contact/      # Sessions, Telnyx + WhatsApp integration
│   │   └── payments/     # Stripe integration
│   ├── config/
│   └── app.ts
├── migrations/
├── Dockerfile
└── package.json

/mobile
├── src/
│   ├── app/              # Expo Router screens
│   ├── components/
│   ├── services/
│   ├── stores/
│   └── i18n/
├── eas.json
├── app.json
└── package.json
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379

# Telnyx (Voice & SMS)
TELNYX_API_KEY=your_api_key
TELNYX_PUBLIC_KEY=your_public_key
TELNYX_CONNECTION_ID=your_connection_id
TELNYX_PHONE_NUMBERS=+971501234567,+971501234568

# WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_SERVICE_ACCOUNT=path/to/service-account.json

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# App
APP_URL=https://app.sampark.ae
API_URL=https://api.sampark.ae
```

---

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Foundation | 2 weeks | Week 2 |
| Authentication | 1 week | Week 3 |
| Vehicles | 1 week | Week 4 |
| Tags & QR | 1 week | Week 5 |
| Contact Sessions | 1 week | Week 6 |
| Masked Comm | 2 weeks | Week 8 |
| Notifications | 1 week | Week 9 |
| Payments | 1 week | Week 10 |
| Testing | 1 week | Week 11 |
| Deployment | 1 week | Week 12 |

**Total: ~12 weeks (3 months) for MVP**

---

## Cost Summary (Monthly @ 10K sessions)

| Service | Cost |
|---------|------|
| AWS Infrastructure | ~$265 |
| Telnyx Voice (20K min) | ~$100 |
| Telnyx SMS (10K msg) | ~$40 |
| WhatsApp (10K conv) | ~$50 |
| **Total** | **~$455/month** |

**Savings vs Twilio: ~58% ($450 → $190 for communications)**

---

## Team Requirements

**Minimum Viable Team:**
- 1 Full-stack Developer (Backend + some Mobile)
- 1 Mobile Developer (React Native)
- 1 Part-time QA

**Recommended Team:**
- 1 Backend Developer
- 1 Mobile Developer
- 1 DevOps/Platform Engineer (part-time)
- 1 QA Engineer (part-time)
- 1 Designer (part-time, for UI/UX polish)
