# Backend Implementation

## Scope

This repository now contains a runnable TypeScript backend for the vehicle assistant as a modular monolith.

This phase intentionally includes:
- OTP-based authentication
- User profile endpoints
- Vehicle CRUD
- Tag generation, activation, and public resolution
- Public contact-session creation
- Persistent in-app/system alerts
- Emergency profile storage
- MySQL migrations and a dev seed script

This phase intentionally excludes:
- Firebase / FCM
- Push delivery providers
- Telnyx-based masked calling
- WhatsApp relay
- Stripe / payments
- Mobile app implementation

## Modular Monolith Structure

```text
server/src
├── app.ts
├── server.ts
├── modules
│   ├── auth
│   ├── users
│   ├── vehicles
│   ├── tags
│   ├── contact
│   ├── alerts
│   ├── emergency-profiles
│   └── system
└── shared
    ├── cache
    ├── config
    ├── database
    ├── events
    ├── http
    ├── middleware
    ├── pii
    └── utils
```

## Module Summary

### `auth`
- `POST /api/v1/auth/otp/request`
- `POST /api/v1/auth/otp/verify`
- `POST /api/v1/auth/firebase/verify`
- `POST /api/v1/auth/refresh`
- OTPs are stored in Redis for mock driver.
- Default delivery mode is `mock`, so development can move forward without SMS infrastructure.
- **Firebase Phone Authentication** is the primary OTP delivery method (`OTP_DRIVER=firebase`).

### `users`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- User identity is created after OTP verification.
- Raw phone numbers are not stored directly in the `users` table. A PII vault reference is stored instead.

### `vehicles`
- `GET /api/v1/vehicles`
- `POST /api/v1/vehicles`
- `GET /api/v1/vehicles/:vehicleId`
- `PATCH /api/v1/vehicles/:vehicleId`
- `DELETE /api/v1/vehicles/:vehicleId`
- Vehicles are soft archived through `deleted_at`.

### `tags`
- `GET /api/v1/tags`
- `POST /api/v1/tags`
- `POST /api/v1/tags/:tagId/activate`
- `POST /api/v1/public/tags/resolve`
- QR payloads use opaque tokens only.
- QR image data URLs are generated server-side.

### `contact`
- `POST /api/v1/public/contact-sessions`
- `GET /api/v1/contact-sessions`
- `PATCH /api/v1/contact-sessions/:sessionId/resolve`
- Contact sessions are stored even though external delivery channels are deferred.
- This allows the public scan flow, audit trail, and alert creation to exist before telephony integration.

### `alerts`
- `GET /api/v1/alerts`
- `PATCH /api/v1/alerts/:alertId/read`
- Alerts are persisted in MySQL.
- Contact-session creation emits an in-process domain event.
- The alerts module subscribes to that event and creates a user alert.

### `emergency-profiles`
- `GET /api/v1/vehicles/:vehicleId/emergency-profile`
- `PUT /api/v1/vehicles/:vehicleId/emergency-profile`
- Contact phone numbers are stored through the PII vault and resolved only when needed.

### `system`
- `GET /health`
- `GET /ready`

## Data Model

Implemented tables:
- `pii_vault_entries`
- `users`
- `refresh_tokens`
- `vehicles`
- `tags`
- `contact_sessions`
- `alerts`
- `emergency_profiles`
- `_migrations`

Migration files:
- [001_initial_schema.up.sql](/home/saikat/workspce/internship/vehical-assistant/server/migrations/001_initial_schema.up.sql)
- [001_initial_schema.down.sql](/home/saikat/workspce/internship/vehical-assistant/server/migrations/001_initial_schema.down.sql)

## Runtime Flow Notes

### Authentication
1. Request OTP.
2. OTP is stored in Redis with TTL and attempt tracking.
3. Verify OTP.
4. User is created or loaded.
5. Access token and refresh token are issued.

### Public Contact Flow
1. Public user submits tag token and reason.
2. Token resolves to vehicle and owner.
3. Contact session is recorded.
4. `contact.session.created` event is emitted.
5. Alerts module persists a new alert for the vehicle owner.

## Environment

Relevant env file:
- [server/.env.example](/home/saikat/workspce/internship/vehical-assistant/server/.env.example)

Important variables:
- `OTP_DRIVER=mock` keeps OTP local and avoids SMS dependency during this phase.
- `APP_BASE_URL` is used when generating QR destination URLs.
- `CLIENT_ORIGINS` controls CORS.

## Commands

From [server/package.json](/home/saikat/workspce/internship/vehical-assistant/server/package.json):

```bash
pnpm build
pnpm migrate:up
pnpm migrate:down
pnpm seed:dev
pnpm dev
```

## Current Delivery Model

The current implementation records intent and application state first. It does not yet perform masked calls, SMS relay, WhatsApp relay, or push notification delivery. That was deliberate so the modular backend, data model, and public contact flow can be stabilized before external providers are introduced.
