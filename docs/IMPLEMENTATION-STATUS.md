# Implementation Status

## Summary

The backend is now started properly as a modular monolith and is no longer just a planning skeleton.

For this phase, Firebase/FCM and similar push-provider work has been intentionally skipped.

## Implemented

| Feature Area | Status | Notes |
|---|---|---|
| Express app bootstrap | Implemented | Runnable `app.ts` and `server.ts` added |
| Modular monolith structure | Implemented | Shared layer + feature modules separated clearly |
| Environment validation | Implemented | `.env.example` updated to match runtime config |
| MySQL connection layer | Implemented | Shared connection manager added and compiling |
| Redis connection layer | Implemented | Used for OTP and rate limiting |
| Migration runner | Implemented | Up/down SQL migration support added |
| Dev seed script | Implemented | Seeds owner, vehicle, tag, session, alert, emergency profile |
| PII vault | Implemented | Encrypted phone storage with reference IDs |
| OTP auth | Implemented | Request, verify, attempt tracking, temporary lock |
| JWT access + refresh | Implemented | Access token + hashed refresh tokens in DB |
| User profile | Implemented | `GET/PATCH /users/me` |
| Vehicle CRUD | Implemented | Owner-scoped create, list, fetch, update, archive |
| Tag generation | Implemented | Opaque token + QR data URL generation |
| Tag activation | Implemented | Owner-scoped activation endpoint |
| Public tag resolution | Implemented | Public resolve endpoint with rate limiting |
| Public contact-session creation | Implemented | Public flow logs sessions against owner/vehicle/tag |
| Owner contact-session management | Implemented | List and resolve endpoints added |
| Alerts persistence | Implemented | Alerts are saved in MySQL |
| In-process domain events | Implemented | Contact-session event triggers alert creation |
| Emergency profile storage | Implemented | Per-vehicle emergency profile with encrypted phone refs |
| Health/readiness endpoints | Implemented | `/health` and `/ready` |
| Build verification | Implemented | `pnpm build` passes |

## Partially Implemented

| Feature Area | Status | Notes |
|---|---|---|
| OTP delivery | Partial | `mock` and optional Twilio path exist, but production SMS delivery is not fully hardened |
| Contact-session lifecycle | Partial | Sessions can be resolved and are marked expired when read, but no background expiry worker exists |
| Alerts | Partial | Persistence exists, but no push or realtime delivery exists |
| Validation | Partial | Core schemas exist, but country-specific plate and phone validation rules are still basic |
| Tag lifecycle | Partial | `generated` and `activated` are supported operationally; `suspended` and `retired` are not yet exposed in routes |
| Contact channels | Partial | `call`, `sms`, `whatsapp`, `in_app` can be requested and stored, but only logging/persistence happens today |

## Not Implemented Yet

| Feature Area | Status | Notes |
|---|---|---|
| Firebase / FCM | Not implemented | Explicitly deferred for now |
| Push notification delivery | Not implemented | No provider integration yet |
| Telnyx masked calling | Not implemented | No number pool, call control, or bridging yet |
| SMS masking / relay | Not implemented | No real masked SMS delivery flow yet |
| WhatsApp Cloud API relay | Not implemented | No templates, webhooks, or relay routing yet |
| Contact history analytics | Not implemented | No reporting/dashboard layer yet |
| Fleet / organization workspace | Not implemented | No org, supervisor, or driver assignment module yet |
| Payments / Stripe | Not implemented | No checkout or subscription module yet |
| Admin or operations portal | Not implemented | No admin UI/backend area yet |
| Mobile app | Not implemented | Backend only in this phase |
| Public landing web UI | Not implemented | Public API exists, but no dedicated web flow yet |

## Recommended Next Build Order

1. Harden migrations and run them against a real local MySQL + Redis environment.
2. Add integration tests for auth, vehicles, tags, and public contact flow.
3. Implement real delivery adapters behind the current contact-session model.
4. Add push notifications only after the alert pipeline is stable.
5. Add fleet, subscriptions, and external provider workflows after MVP backend paths are proven.

## Source of Truth

Implementation docs:
- [BACKEND-IMPLEMENTATION.md](/home/saikat/workspce/internship/vehical-assistant/docs/BACKEND-IMPLEMENTATION.md)

Primary backend entrypoints:
- [app.ts](/home/saikat/workspce/internship/vehical-assistant/server/src/app.ts)
- [server.ts](/home/saikat/workspce/internship/vehical-assistant/server/src/server.ts)
