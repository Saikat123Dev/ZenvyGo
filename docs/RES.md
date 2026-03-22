# Vehicle Contact App - Product Requirements Document

## 1. Purpose

A mobile-first vehicle contact and safety platform for the Middle East market. The product enables privacy-safe communication between vehicle owners and bystanders through masked channels.

**Product Scope:**
- Android app
- iOS app
- Backend APIs and services

**Out of Scope (Phase 1):**
- Full public web product
- Desktop admin portal
- Third-party marketplace

## 2. Product Vision

Build a trusted vehicle-contact platform that lets any authorized person quickly reach a vehicle owner during parking, safety, or emergency situations without exposing personal phone numbers.

## 3. Primary Goals

- Replace dashboard phone-number cards with privacy-safe digital identity tags
- Let a bystander contact the owner in less than 30 seconds
- Support both personal vehicles and organization-managed fleets
- Work well in UAE, Saudi Arabia, and Qatar
- Make Arabic and English first-class from day one

## 4. Target Users

| User Type | Description |
|-----------|-------------|
| Private Vehicle Owner | Registers vehicle, activates tag, receives masked contact requests |
| Fleet Driver | Uses app for company vehicles assigned by organization |
| Bystander/Security Guard | Needs fast way to notify vehicle owner about parking issues |
| Fleet Supervisor | Mobile visibility into tag status and fleet alerts |

## 5. Problem Statement

Vehicle owners expose their phone number on paper cards, creating privacy and harassment risks. Parking attendants and emergency responders still need a reliable way to contact drivers quickly.

**Solution:** A mobile platform giving each vehicle a secure, scannable identity that routes communication through masked channels.

## 6. Core Feature Scope (MVP)

| Module | Description | Priority |
|--------|-------------|----------|
| User onboarding | Sign-up, OTP login, language, region, consent | P0 |
| Vehicle management | Add, edit, verify, and archive vehicles | P0 |
| Tag management | QR tag, printable eTag, activation lifecycle | P0 |
| Public contact flow | Scan tag, choose reason, contact via masked channels | P0 |
| Notifications | Push alerts, missed contact alerts | P0 |
| Emergency profile | Emergency contacts, roadside assistance info | P0 |
| Masked communication | Voice call, SMS, WhatsApp relay masking | P0 |
| Contact history | Contact logs, reason codes, resolution status | P1 |
| Basic fleet workspace | Driver assignment, org vehicles, supervisor view | P1 |
| Payments | Tag ordering, basic subscription plans | P1 |

---

## 7. Core Feature Definitions

### 7.1 Authentication and Onboarding

**Supported Features:**
- Phone-number-based OTP sign-in
- Country and language selection (Arabic/English)
- Consent capture for privacy policy and telecom terms
- Optional biometric unlock

**Onboarding Flow:**
1. Select country → 2. Select language → 3. Enter mobile number → 4. Verify OTP → 5. Create profile → 6. Add first vehicle → 7. Activate tag → 8. Grant permissions

### 7.2 Vehicle Management

**Core Capabilities:**
- Register one or more vehicles
- Capture region-specific plate format (Latin and Arabic)
- Store make, model, color, year, and photo
- Assign primary owner and current active driver
- Deactivate lost or retired vehicles

### 7.3 Tag Management

**Supported Tag Types:**
- Printable QR eTag (free)
- Physical windshield sticker with QR (paid)

**Tag Lifecycle States:**
`unassigned` → `assigned` → `activated` → `suspended` → `retired`

**Critical Rule:** QR payload must never contain raw phone number or plate. Only an opaque token resolved by backend.

### 7.4 Public Contact Flow (Core Product)

**Bystander Journey:**
1. Scan QR tag (or enter plate if permitted)
2. Select reason for contact
3. Choose communication channel
4. Initiate contact without seeing owner's phone number

**Reason Codes:**
- Vehicle is blocking access
- Lights are on
- Window/door is open
- Towing risk
- Accident/damage observed
- Security concern
- Urgent personal reason

**Communication Channels:**
- Masked voice call (primary)
- Masked SMS notification
- WhatsApp Business relay
- In-app message with push notification

### 7.5 Contact Session Management

**Session Data:**
- Session ID, vehicle ID, tag ID
- Reason code, selected channel
- Timestamps, status, resolution state

**Session States:**
`initiated` → `delivered` → `answered` / `missed` / `failed` → `resolved` / `expired`

### 7.6 Notifications

**Required Notifications:**
- Push notification for every contact request
- Missed-call and missed-message alerts
- Tag activation/deactivation alerts

### 7.7 Emergency Profile

**Optional Fields:**
- Up to 3 emergency contacts
- Blood group and medical notes (with consent)
- Insurer name and policy reference
- Roadside assistance number

---

## 8. Masked Communication Architecture

### 8.1 Overview

Masking ensures neither party sees the other's real phone number. The platform acts as an intermediary using virtual numbers or relay systems.

**Why Masking is Critical:**
- Privacy protection (prevents harassment)
- Platform control (rate-limiting, audit, abuse detection)
- Legal compliance (data minimization)

### 8.2 Voice Call Masking

**Architecture:**

```
Bystander                    Platform                     Vehicle Owner
    │                           │                              │
    │  1. Scan QR               │                              │
    ├──────────────────────────>│                              │
    │                           │  2. Allocate virtual numbers │
    │                           │     Virtual-A, Virtual-B     │
    │                           │                              │
    │  3. Call from Virtual-A   │                              │
    │<──────────────────────────┤                              │
    │  (Bystander answers)      │                              │
    │                           │  4. Call from Virtual-B      │
    │                           ├─────────────────────────────>│
    │                           │  (Owner answers)             │
    │                           │                              │
    │  5. Bridge both parties   │                              │
    │<══════════════════════════╪═════════════════════════════>│
    │                           │                              │
    │  6. Call ends → Release virtual numbers                  │
```

**Implementation Flow:**
1. Bystander scans QR → Backend creates ContactSession
2. Backend requests virtual numbers from Telnyx
3. System calls bystander using Virtual-A → bystander answers
4. System calls owner using Virtual-B → owner answers
5. Conference bridge connects both parties
6. After hangup, virtual numbers released to pool

**Call Flow States:**
```
INITIATED → RINGING_CALLER → CALLER_ANSWERED → RINGING_OWNER → CONNECTED → COMPLETED
                                                    ↓
                                              OWNER_MISSED → (Push notification)
```

**Anti-Abuse Controls:**
- Max 3 calls per QR per day per unique caller
- 5-minute cooldown between successive sessions
- Owner can mark sessions as spam → blacklist caller

### 8.3 SMS Masking

**Flow:**
1. Bystander sends message via app
2. Backend sends SMS using alphanumeric sender ID (e.g., "SAMPARK")
3. Owner receives SMS with masked sender + deep link
4. Owner replies via app (not direct SMS)

**Message Template:**
```
Vehicle Alert: Someone needs to contact you.
Vehicle: ****1234
Reason: Blocking access
Tap to respond: [APP_LINK]
```

**Requirements:**
- Alphanumeric sender ID (requires carrier approval)
- Unicode/Arabic support (70 chars limit for Arabic)
- Delivery receipt webhooks

### 8.4 WhatsApp Cloud API Integration

**Flow:**
1. Backend sends template message via Meta WhatsApp Cloud API
2. Owner sees message from business account (e.g., "Sampark Alerts")
3. Owner replies → Backend routes to bystander's app inbox

**Pre-approved Template:**
```
Hello {{name}},

Someone needs to contact you about your vehicle ({{plate}}).
Reason: {{reason}}

[Tap to Respond]
```

**Requirements:**
- Meta Business Manager account
- Verified WhatsApp Business profile
- Approved message templates (submit via WhatsApp Manager)
- Webhook server for inbound messages

**Cost:** ~$0.005 per conversation (Utility category, 24-hour window)

### 8.5 Channel Selection Logic

```
IF reason_code IN ('accident', 'security_concern'):
    channel = VOICE_CALL  # Most urgent

ELSE IF current_time IN quiet_hours:
    channel = WHATSAPP or IN_APP_MESSAGE  # Silent

ELSE:
    channel = owner_preference OR highest_response_rate_channel
```

**Fallback Cascade:**
1. Primary channel (30s timeout for voice, 2min for message)
2. Secondary channel (push + SMS)
3. Emergency contacts (if configured and urgent)
4. Session expires after 15-30 minutes

### 8.6 Security Controls

**Data Minimization:**
- Store only masked telecom identifiers in operational DB
- Real phone numbers in encrypted PII vault (AES-256)
- Virtual number mappings auto-purged after session expiry

**Audit Trail (Required for every session):**
- Session ID, timestamps
- Vehicle and tag involved
- Reason code, channel used
- Connection status and duration
- Cost incurred

---

## 9. Technical Architecture

### 9.1 Mobile Stack

**Recommended:**
- React Native with Expo
- TypeScript
- Expo Router (navigation)
- TanStack Query (server state)
- Zustand (app state)
- Expo SecureStore (tokens)
- react-i18next (localization)

### 9.2 App Folder Structure

```
src/
  app/
    (auth)/          # Login, OTP, consent
    (main)/          # Dashboard, vehicles, scan, alerts, profile
    modals/          # Contact actions, emergency details
  components/
    ui/              # Buttons, inputs, cards
    feature/         # Vehicle card, contact session
  modules/
    auth/
    vehicles/
    tags/
    contact/
    emergency/
  services/
    api/
    notifications/
    storage/
  i18n/
  config/
  types/
```

### 9.3 Navigation Structure

**Bottom Tabs:**
- Home (dashboard)
- Vehicles
- Scan (QR scanner)
- Alerts
- Profile

### 9.4 Backend Services

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Mobile Apps │────>│   API Gateway   │────>│ Core Services   │
└─────────────┘     └─────────────────┘     └─────────────────┘
                                                    │
                    ┌───────────────────────────────┼───────────────────────────────┐
                    │                               │                               │
              ┌─────▼─────┐                 ┌───────▼───────┐              ┌────────▼────────┐
              │   Auth    │                 │    Vehicle    │              │ Contact Session │
              │  Service  │                 │    Service    │              │    Service      │
              └───────────┘                 └───────────────┘              └─────────────────┘
                                                                                   │
                                                                    ┌──────────────┼──────────────┐
                                                                    │              │              │
                                                              ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
                                                              │  Twilio   │  │  WhatsApp │  │   Push    │
                                                              │   API     │  │    API    │  │  Service  │
                                                              └───────────┘  └───────────┘  └───────────┘
```

**Core Services:**

| Service | Responsibility |
|---------|----------------|
| Auth Service | OTP, token issuance, device sessions |
| Vehicle Service | Vehicle registry, assignments |
| Tag Service | QR token lookup, tag lifecycle |
| Contact Session Service | Masked routing, status tracking |
| Notification Service | Push events, reminders |

### 9.5 Data Model (Core Entities)

| Entity | Core Fields |
|--------|-------------|
| User | id, name, phoneRef (vault key), language, country, status |
| Vehicle | id, ownerId, plateNumber, make, model, status |
| Tag | id, token, vehicleId, state, issuedAt |
| ContactSession | id, vehicleId, tagId, reasonCode, channel, status |
| ContactAttempt | id, sessionId, provider, outcome, startedAt |
| Alert | id, userId, sessionId, severity, state |

**Important:** `phoneRef` points to encrypted PII vault, not raw phone number.

### 9.6 API Endpoints (Core)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/otp/request` | Request OTP |
| POST | `/auth/otp/verify` | Verify OTP, issue tokens |
| GET | `/config/bootstrap` | Language, country, feature config |
| POST | `/vehicles` | Create vehicle |
| POST | `/vehicles/{id}/activate-tag` | Activate tag |
| POST | `/tags/resolve` | Resolve QR token to contact context |
| POST | `/contact-sessions` | Create session from scan |
| POST | `/contact-sessions/{id}/call` | Initiate masked voice call |
| POST | `/contact-sessions/{id}/message` | Send masked message |
| GET | `/alerts` | Fetch alerts |

---

## 10. Non-Functional Requirements

| Area | Requirement |
|------|-------------|
| Availability | 99.9% uptime for core APIs |
| Performance | QR scan to action screen < 2 seconds |
| Security | PII encrypted at rest (AES-256), TLS in transit |
| Privacy | Owner contact data never shown to unauthorized users |
| Localization | Full English and Arabic support with RTL |
| Auditability | Every session and lookup logged |

---

## 11. User Journeys

### 11.1 Owner Onboarding

1. Install app → 2. Select country/language → 3. OTP login → 4. Create profile → 5. Add vehicle → 6. Activate tag → 7. Land on dashboard

### 11.2 Contact Vehicle (Bystander)

1. Scan QR tag → 2. Select reason → 3. Choose channel → 4. Owner receives alert → 5. Session marked answered/missed

### 11.3 Lost Tag Replacement

1. Report tag lost → 2. Tag suspended → 3. Temporary eTag issued → 4. Old tag blocked permanently

---

## 12. MVP Release Scope

**Included:**
- OTP login with Arabic/English
- Vehicle registration (1-3 vehicles)
- QR/eTag activation
- Masked voice call
- Masked SMS notifications
- Push notifications
- Emergency contacts
- Basic contact history

**Excluded from MVP:**
- NFC tags
- Document vault
- Entry/exit logs
- Advanced fleet features
- Partner integrations
- Analytics dashboards

---

## 13. Open Decisions

- Which countries in phase 1? (Recommend: UAE first)
- Is WhatsApp relay mandatory or optional?
- Is public plate search allowed?
- Call recording permitted?

---

## 14. Recommended Team

- 1 Product Manager
- 1 UX Designer (Arabic/RTL experience)
- 2 React Native Engineers
- 1 Backend Engineer
- 1 QA Engineer
