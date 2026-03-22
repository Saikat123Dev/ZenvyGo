# Vehicle Contact App - System Design Document

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────────────┐  │
│  │ Android App │  │   iOS App   │  │  QR Landing Page (Mobile Web)      │  │
│  │ (React      │  │ (React      │  │  - No app install required         │  │
│  │  Native)    │  │  Native)    │  │  - Scan → Contact flow             │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────────────┬──────────────────┘  │
│         │                │                            │                      │
└─────────┼────────────────┼────────────────────────────┼──────────────────────┘
          │                │                            │
          └────────────────┼────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        API Gateway (Kong/AWS)                        │    │
│  │  - Rate Limiting    - Auth Validation    - Request Routing          │    │
│  └─────────────────────────────────┬───────────────────────────────────┘    │
│                                    │                                         │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │    Auth    │ │  Vehicle   │ │    Tag     │ │  Contact   │ │   Alert    │ │
│  │  Service   │ │  Service   │ │  Service   │ │  Service   │ │  Service   │ │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ │
│        │              │              │              │              │         │
└────────┼──────────────┼──────────────┼──────────────┼──────────────┼─────────┘
         │              │              │              │              │
         ▼              ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────────────────┐│
│  │ PostgreSQL │ │   Redis    │ │  PII Vault │ │     Object Storage         ││
│  │ (Primary)  │ │  (Cache)   │ │(Encrypted) │ │  (S3 - Tags, Documents)    ││
│  └────────────┘ └────────────┘ └────────────┘ └────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │  Telnyx    │ │  WhatsApp  │ │    FCM     │ │   Stripe   │               │
│  │ (Voice/SMS)│ │ Cloud API  │ │   (Push)   │ │ (Payments) │               │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Mobile App | React Native + Expo | Android/iOS client |
| API Gateway | Node.js + Express | Request routing, auth |
| Auth Service | Node.js | OTP, JWT tokens |
| Vehicle Service | Node.js | Vehicle CRUD |
| Tag Service | Node.js | QR generation, resolution |
| Contact Service | Node.js | Masked communication |
| Database | PostgreSQL | Persistent storage |
| Cache | Redis | Sessions, rate limiting |
| PII Vault | Vault/Custom | Encrypted phone numbers |

---

## 2. Database Schema

### 2.1 Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │   vehicles   │       │     tags     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │───┐   │ id (PK)      │───┐   │ id (PK)      │
│ phone_ref    │   │   │ owner_id(FK) │◄──┘   │ token        │
│ name         │   │   │ plate_number │       │ vehicle_id(FK)│◄──┐
│ language     │   │   │ make         │       │ state        │   │
│ country      │   │   │ model        │       │ created_at   │   │
│ created_at   │   │   │ color        │       └──────────────┘   │
└──────────────┘   │   │ status       │                          │
                   │   └──────────────┘                          │
                   │                                             │
                   │   ┌──────────────────┐                      │
                   │   │ contact_sessions │                      │
                   │   ├──────────────────┤                      │
                   │   │ id (PK)          │                      │
                   └──►│ vehicle_id (FK)  │──────────────────────┘
                       │ tag_id (FK)      │
                       │ reason_code      │
                       │ channel          │
                       │ status           │
                       │ created_at       │
                       │ expires_at       │
                       └──────────────────┘
```

### 2.2 Core Tables SQL

```sql
-- Users table (phone stored in PII vault, only reference here)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_ref VARCHAR(100) NOT NULL UNIQUE,  -- Reference to PII vault
    name VARCHAR(100) NOT NULL,
    language VARCHAR(5) DEFAULT 'en',
    country VARCHAR(3) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id),
    plate_number VARCHAR(20) NOT NULL,
    plate_arabic VARCHAR(20),
    make VARCHAR(50),
    model VARCHAR(50),
    color VARCHAR(30),
    year INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(64) NOT NULL UNIQUE,  -- Opaque token for QR
    vehicle_id UUID REFERENCES vehicles(id),
    type VARCHAR(20) DEFAULT 'qr',  -- qr, nfc, etag
    state VARCHAR(20) DEFAULT 'unassigned',
    created_at TIMESTAMP DEFAULT NOW(),
    activated_at TIMESTAMP
);

-- Contact sessions table
CREATE TABLE contact_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    tag_id UUID REFERENCES tags(id),
    reason_code VARCHAR(50) NOT NULL,
    channel VARCHAR(20),  -- voice, sms, whatsapp
    status VARCHAR(20) DEFAULT 'initiated',
    caller_context JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    session_id UUID REFERENCES contact_sessions(id),
    title VARCHAR(200),
    body TEXT,
    severity VARCHAR(20) DEFAULT 'normal',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Emergency profiles table
CREATE TABLE emergency_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) UNIQUE,
    contact1_name VARCHAR(100),
    contact1_phone_ref VARCHAR(100),
    contact2_name VARCHAR(100),
    contact2_phone_ref VARCHAR(100),
    blood_group VARCHAR(10),
    medical_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);
CREATE INDEX idx_tags_token ON tags(token);
CREATE INDEX idx_tags_vehicle ON tags(vehicle_id);
CREATE INDEX idx_sessions_vehicle ON contact_sessions(vehicle_id);
CREATE INDEX idx_sessions_status ON contact_sessions(status);
CREATE INDEX idx_alerts_user ON alerts(user_id);
```

---

## 3. API Specifications

### 3.1 Authentication APIs

```yaml
POST /api/v1/auth/otp/request
  Body: { phone: "+971501234567", country: "AE" }
  Response: { success: true, expires_in: 300 }

POST /api/v1/auth/otp/verify
  Body: { phone: "+971501234567", otp: "123456" }
  Response: { access_token: "jwt...", refresh_token: "...", user: {...} }

POST /api/v1/auth/refresh
  Body: { refresh_token: "..." }
  Response: { access_token: "jwt..." }
```

### 3.2 Vehicle APIs

```yaml
GET /api/v1/vehicles
  Headers: Authorization: Bearer <token>
  Response: { vehicles: [...] }

POST /api/v1/vehicles
  Headers: Authorization: Bearer <token>
  Body: { plate_number: "A12345", make: "Toyota", model: "Camry" }
  Response: { vehicle: {...} }

PATCH /api/v1/vehicles/:id
  Headers: Authorization: Bearer <token>
  Body: { color: "White" }
  Response: { vehicle: {...} }

DELETE /api/v1/vehicles/:id
  Headers: Authorization: Bearer <token>
  Response: { success: true }
```

### 3.3 Tag APIs

```yaml
POST /api/v1/tags/generate
  Headers: Authorization: Bearer <token>
  Body: { vehicle_id: "uuid", type: "qr" }
  Response: { tag: {...}, qr_url: "https://..." }

POST /api/v1/tags/resolve
  Body: { token: "abc123xyz" }
  Response: { vehicle_id: "...", reason_codes: [...], channels: [...] }

POST /api/v1/vehicles/:id/activate-tag
  Headers: Authorization: Bearer <token>
  Body: { tag_id: "uuid" }
  Response: { success: true }
```

### 3.4 Contact Session APIs

```yaml
POST /api/v1/contact-sessions
  Body: {
    tag_token: "abc123",
    reason_code: "blocking_access",
    channel: "voice"
  }
  Response: { session_id: "...", status: "initiated" }

POST /api/v1/contact-sessions/:id/call
  Response: { call_status: "connecting" }

POST /api/v1/contact-sessions/:id/message
  Body: { message: "Your car is blocking my garage" }
  Response: { status: "sent" }

GET /api/v1/contact-sessions/:id/status
  Response: { status: "connected", duration: 45 }
```

### 3.5 Alert APIs

```yaml
GET /api/v1/alerts
  Headers: Authorization: Bearer <token>
  Response: { alerts: [...], unread_count: 5 }

PATCH /api/v1/alerts/:id/read
  Headers: Authorization: Bearer <token>
  Response: { success: true }
```

---

## 4. Masked Communication Flow

### 4.1 Voice Call Sequence

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│Bystander│     │   App   │     │ Backend │     │ Telnyx  │     │  Owner  │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │               │
     │  Scan QR      │               │               │               │
     │──────────────>│               │               │               │
     │               │  POST /resolve│               │               │
     │               │──────────────>│               │               │
     │               │  session_id   │               │               │
     │               │<──────────────│               │               │
     │               │               │               │               │
     │  Tap "Call"   │               │               │               │
     │──────────────>│               │               │               │
     │               │  POST /call   │               │               │
     │               │──────────────>│               │               │
     │               │               │  Create Call  │               │
     │               │               │──────────────>│               │
     │               │               │               │  Ring Owner   │
     │               │               │               │──────────────>│
     │               │               │               │               │
     │               │               │               │  Owner Answers│
     │               │               │               │<──────────────│
     │               │               │  Bridge Call  │               │
     │<══════════════╪═══════════════╪═══════════════╪══════════════>│
     │               │               │               │               │
     │         MASKED CONVERSATION (Neither sees real number)        │
     │               │               │               │               │
```

### 4.2 Virtual Number Pool Management

```javascript
// Simplified pool management (Redis-based)
class VirtualNumberPool {
  async allocate(sessionId) {
    const number = await redis.rpop('virtual_numbers:available');
    await redis.setex(`number:${number}:session`, 1800, sessionId);
    return number;
  }

  async release(number) {
    await redis.del(`number:${number}:session`);
    await redis.lpush('virtual_numbers:available', number);
  }
}
```

---

## 5. Security Architecture

### 5.1 PII Vault Design

```
┌─────────────────────────────────────────────────────────┐
│                    Application DB                        │
│  users.phone_ref = "vault_key_abc123"  (reference only) │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼  Lookup via internal API
┌─────────────────────────────────────────────────────────┐
│                      PII Vault                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  key: "vault_key_abc123"                        │    │
│  │  value: AES-256-GCM encrypted("+971501234567") │    │
│  │  iv: "random_iv"                                │    │
│  │  auth_tag: "gcm_tag"                            │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Rate Limiting Rules

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /auth/otp/request | 5 requests | 15 minutes |
| POST /tags/resolve | 20 requests | 1 hour |
| POST /contact-sessions | 10 requests | 1 hour |
| POST /contact-sessions/:id/call | 3 requests | 30 minutes |

### 5.3 JWT Token Structure

```json
{
  "sub": "user_uuid",
  "iat": 1234567890,
  "exp": 1234571490,
  "country": "AE",
  "language": "en",
  "type": "access"
}
```

---

## 6. Mobile App Architecture

### 6.1 Folder Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── otp.tsx
│   │   └── onboarding.tsx
│   ├── (main)/
│   │   ├── index.tsx       # Dashboard
│   │   ├── vehicles/
│   │   ├── scan.tsx
│   │   ├── alerts.tsx
│   │   └── profile.tsx
│   └── _layout.tsx
├── components/
│   ├── ui/                 # Button, Input, Card
│   └── feature/            # VehicleCard, AlertItem
├── services/
│   ├── api.ts              # API client
│   ├── auth.ts             # Auth logic
│   └── notifications.ts    # Push setup
├── stores/
│   ├── authStore.ts        # Zustand auth state
│   └── vehicleStore.ts
├── hooks/
│   ├── useVehicles.ts      # TanStack Query hooks
│   └── useAlerts.ts
├── i18n/
│   ├── en.json
│   └── ar.json
└── config/
    └── constants.ts
```

### 6.2 State Management

```
┌─────────────────────────────────────────────────────────┐
│                    State Architecture                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │   Zustand    │    │ TanStack     │                   │
│  │  (App State) │    │   Query      │                   │
│  │              │    │(Server State)│                   │
│  │ - Auth token │    │              │                   │
│  │ - Language   │    │ - Vehicles   │                   │
│  │ - Theme      │    │ - Alerts     │                   │
│  │ - User prefs │    │ - Sessions   │                   │
│  └──────────────┘    └──────────────┘                   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Expo SecureStore                     │   │
│  │         (Persisted secure storage)                │   │
│  │  - JWT tokens    - Biometric keys                 │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Deployment Architecture

### 7.1 Cloud Infrastructure (AWS)

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐     ┌─────────────────────────────────────┐    │
│  │ CloudFront  │────>│          Load Balancer              │    │
│  │   (CDN)     │     └──────────────┬──────────────────────┘    │
│  └─────────────┘                    │                            │
│                                     ▼                            │
│                    ┌────────────────────────────────┐            │
│                    │        ECS Fargate             │            │
│                    │  ┌──────┐ ┌──────┐ ┌──────┐   │            │
│                    │  │ API  │ │ API  │ │ API  │   │            │
│                    │  │  #1  │ │  #2  │ │  #3  │   │            │
│                    │  └──────┘ └──────┘ └──────┘   │            │
│                    └────────────────────────────────┘            │
│                                     │                            │
│         ┌───────────────────────────┼───────────────────────┐    │
│         │                           │                       │    │
│         ▼                           ▼                       ▼    │
│  ┌─────────────┐           ┌─────────────┐          ┌──────────┐│
│  │    RDS      │           │ ElastiCache │          │    S3    ││
│  │ PostgreSQL  │           │   (Redis)   │          │ (Assets) ││
│  └─────────────┘           └─────────────┘          └──────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Environment Configuration

```
Production:
- API: api.sampark.ae
- Web: app.sampark.ae
- Region: me-south-1 (Bahrain)

Staging:
- API: api-staging.sampark.ae
- Region: me-south-1

Development:
- API: localhost:3000
```

---

## 8. Monitoring and Observability

### 8.1 Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response Time (p95) | < 200ms | > 500ms |
| Error Rate | < 0.1% | > 1% |
| OTP Delivery Success | > 99% | < 95% |
| Voice Call Success | > 95% | < 90% |
| App Crash Rate | < 0.1% | > 0.5% |

### 8.2 Logging Strategy

```javascript
// Structured logging format
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info",
  "service": "contact-service",
  "trace_id": "abc123",
  "event": "call_initiated",
  "session_id": "session_uuid",
  "channel": "voice",
  "duration_ms": 150
}
```

---

## 9. Cost Estimates

### 9.1 Infrastructure (Monthly)

| Service | Specification | Cost (USD) |
|---------|---------------|------------|
| ECS Fargate | 2 vCPU, 4GB × 3 instances | $150 |
| RDS PostgreSQL | db.t3.medium | $70 |
| ElastiCache Redis | cache.t3.small | $25 |
| S3 + CloudFront | 50GB + 100GB transfer | $20 |
| **Total Infrastructure** | | **~$265/month** |

### 9.2 Third-Party Services (Per 10K Sessions)

| Service | Usage | Cost (USD) |
|---------|-------|------------|
| Telnyx Voice | 10K calls × 2 min @ $0.005/min | $100 |
| Telnyx SMS | 10K messages @ $0.004/msg | $40 |
| WhatsApp Cloud API | 10K conversations @ $0.005/conv | $50 |
| FCM/APNS | Unlimited | Free |
| **Total per 10K sessions** | | **~$190** |

### 9.3 Cost Comparison (Telnyx vs Twilio)

| Service | Twilio Cost | Telnyx Cost | Savings |
|---------|-------------|-------------|---------|
| Voice (per min) | $0.014 | $0.005 | 64% |
| SMS (per msg) | $0.0079 | $0.004 | 49% |
| Phone Number | $1-15/mo | $1-5/mo | ~50% |
| **10K Sessions** | **$450** | **$190** | **58%** |

---

## 10. Telnyx Integration Details

### 10.1 Telnyx Setup Requirements

**Account Setup:**
1. Create account at telnyx.com
2. Complete KYC verification
3. Purchase phone numbers (Virtual numbers for UAE)
4. Enable Call Control API
5. Configure webhook URLs

**Required API Credentials:**
```
TELNYX_API_KEY=your_api_key
TELNYX_PUBLIC_KEY=your_public_key
TELNYX_CONNECTION_ID=your_connection_id
TELNYX_PHONE_NUMBERS=+971501234567,+971501234568,...
```

### 10.2 Telnyx Voice Call Flow

```javascript
// Telnyx Call Control API - Simplified Flow
const telnyx = require('telnyx')(TELNYX_API_KEY);

// Step 1: Initiate call to bystander
const callToBystander = await telnyx.calls.create({
  connection_id: TELNYX_CONNECTION_ID,
  to: bystanderPhone,
  from: virtualNumber,
  webhook_url: `${BACKEND_URL}/webhooks/telnyx/call-events`,
  webhook_url_method: 'POST'
});

// Step 2: On answer, bridge to owner
// Webhook handler receives call.answered event
app.post('/webhooks/telnyx/call-events', async (req, res) => {
  const event = req.body.data;

  if (event.event_type === 'call.answered') {
    // Create conference and bridge calls
    await telnyx.calls.create({
      connection_id: TELNYX_CONNECTION_ID,
      to: ownerPhone,
      from: virtualNumber2,
      webhook_url: `${BACKEND_URL}/webhooks/telnyx/owner-events`
    });
  }
});
```

### 10.3 Telnyx Webhook Events

| Event | Description | Action |
|-------|-------------|--------|
| call.initiated | Call started | Log session |
| call.answered | Party answered | Bridge if both answered |
| call.hangup | Call ended | Release numbers, log duration |
| call.machine.detection.ended | Voicemail detected | Send SMS fallback |

### 10.4 Telnyx SMS Integration

```javascript
// Send SMS via Telnyx
const message = await telnyx.messages.create({
  from: TELNYX_PHONE_NUMBER,
  to: ownerPhone,
  text: `Vehicle Alert: Someone needs to contact you about your vehicle.\n\nReason: ${reasonCode}\nTap to respond: ${deepLink}`
});
```

---

## 11. WhatsApp Cloud API Integration

### 11.1 Setup Requirements

**Meta Business Account Setup:**
1. Create Meta Business Account (business.facebook.com)
2. Create WhatsApp Business Account
3. Register a phone number for WhatsApp
4. Create message templates and submit for approval
5. Generate access token

**Required Credentials:**
```
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
```

### 11.2 WhatsApp API Endpoints

**Send Template Message:**
```javascript
const axios = require('axios');

async function sendWhatsAppAlert(sessionId, ownerPhone, ownerName, vehiclePlate, reason) {
  const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const response = await axios.post(url, {
    messaging_product: 'whatsapp',
    to: ownerPhone.replace('+', ''), // Remove + prefix
    type: 'template',
    template: {
      name: 'vehicle_contact_alert',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: ownerName },
            { type: 'text', text: vehiclePlate },
            { type: 'text', text: reason }
          ]
        },
        {
          type: 'button',
          sub_type: 'url',
          index: 0,
          parameters: [
            { type: 'text', text: sessionId }
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
```

### 11.3 WhatsApp Message Templates

**Template Name:** `vehicle_contact_alert`
**Category:** UTILITY
**Language:** English (en)

```
Body:
Hello {{1}},

Someone needs to contact you about your vehicle ({{2}}).

Reason: {{3}}

Tap below to respond or view details.

Button: [View Details] → https://app.sampark.ae/session/{{1}}
```

**Template Approval:** Submit via Meta Business Suite → WhatsApp Manager → Message Templates

### 11.4 WhatsApp Webhook Handler

```javascript
// Webhook verification (required by Meta)
app.get('/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle incoming messages and status updates
app.post('/webhooks/whatsapp', (req, res) => {
  const body = req.body;

  if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
    const message = body.entry[0].changes[0].value.messages[0];
    // Handle incoming reply from owner
    handleOwnerReply(message);
  }

  if (body.entry?.[0]?.changes?.[0]?.value?.statuses) {
    const status = body.entry[0].changes[0].value.statuses[0];
    // Update message delivery status
    updateMessageStatus(status);
  }

  res.sendStatus(200);
});
```

### 11.5 WhatsApp Pricing

| Conversation Type | Cost (USD) |
|-------------------|------------|
| User-initiated (replies) | Free |
| Business-initiated (Utility) | $0.005 - $0.015 |
| Business-initiated (Marketing) | $0.02 - $0.05 |

**Our Use Case:** Utility category = ~$0.005 per conversation
