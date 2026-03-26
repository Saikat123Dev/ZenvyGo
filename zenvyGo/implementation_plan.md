# Taxi Role Switch with Document Visibility Settings

Users can switch between **normal** (default) and **taxi** roles. Taxi users must upload/manage driving-related documents; normal vehicle owners do not. An admin-friendly `documentVisibilitySettings` JSON column lets each user configure which document types are visible to passengers, adjustable in Settings.

---

## User Review Required

> [!IMPORTANT]  
> The database already has an `is_driver` column (from migration 004) but it's never used in the service layer. This plan replaces it with a proper `role ENUM('normal','taxi')` column. If the `is_driver` column has live data you care about, we can migrate existing values.

> [!IMPORTANT]  
> **Design decision**: When a user's role is `normal`, the Documents screen shows a prompt to switch to taxi mode rather than hiding the tab entirely. This keeps discoverability high. Let me know if you prefer a different approach.

---

## Proposed Changes

### Database Migration

#### [NEW] [006_user_role_and_doc_settings.up.sql](file:///home/saikat/workspce/internship/vehical-assistant/server/migrations/006_user_role_and_doc_settings.up.sql)
#### [NEW] [006_user_role_and_doc_settings.down.sql](file:///home/saikat/workspce/internship/vehical-assistant/server/migrations/006_user_role_and_doc_settings.down.sql)

- Add `role ENUM('normal','taxi') NOT NULL DEFAULT 'normal'` to `users` table
- Add `document_visibility_settings JSON NULL` to `users` table (stores which doc types are visible per user)
- Drop the old `is_driver` column (redundant)

---

### Server — Users Module

#### [MODIFY] [user.repository.ts](file:///home/saikat/workspce/internship/vehical-assistant/server/src/modules/users/user.repository.ts)

- Add `role` and `document_visibility_settings` to [UserRecord](file:///home/saikat/workspce/internship/vehical-assistant/server/src/modules/users/user.repository.ts#4-18) interface and all SELECT queries
- Add `updateRole()` method
- Add `updateDocumentVisibilitySettings()` method

#### [MODIFY] [user.service.ts](file:///home/saikat/workspce/internship/vehical-assistant/server/src/modules/users/user.service.ts)

- Add `role` and `documentVisibilitySettings` to [User](file:///home/saikat/workspce/internship/vehical-assistant/server/src/modules/users/user.service.ts#5-16) interface
- Add `switchRole(userId, role)` method
- Add `getDocumentVisibilitySettings(userId)` / `updateDocumentVisibilitySettings(userId, settings)` methods
- Expose default doc visibility settings: `{ driving_license: true, rc: true, puc: true, insurance: true, other: false }`

#### [MODIFY] [user.schemas.ts](file:///home/saikat/workspce/internship/vehical-assistant/server/src/modules/users/user.schemas.ts)

- Add `switchRoleSchema` — validates `{ role: 'normal' | 'taxi' }`
- Add `updateDocumentVisibilitySettingsSchema` — validates `{ driving_license?: boolean, rc?: boolean, ... }`

#### [MODIFY] [user.routes.ts](file:///home/saikat/workspce/internship/vehical-assistant/server/src/modules/users/user.routes.ts)

- `PATCH /users/me/role` — switch role between normal/taxi
- `GET /users/me/document-settings` — get current doc visibility settings
- `PUT /users/me/document-settings` — update doc visibility settings

---

### App — API & Types

#### [MODIFY] [api.ts](file:///home/saikat/workspce/internship/vehical-assistant/zenvyGo/lib/api.ts)

- Add `role` and `documentVisibilitySettings` to [AuthUser](file:///home/saikat/workspce/internship/vehical-assistant/zenvyGo/lib/api.ts#19-30) interface
- Add `DocumentVisibilitySettings` type
- Add `switchRole(role)`, `getDocumentSettings()`, `updateDocumentSettings(settings)` methods

---

### App — Settings Screen

#### [MODIFY] [settings.tsx](file:///home/saikat/workspce/internship/vehical-assistant/zenvyGo/app/(main)/settings.tsx)

Add a new **"Role & Documents"** section to settings with:
1. **Role switch** — Toggle between Normal/Taxi with a visual card selector (like the theme picker)
2. **Document Visibility Settings** — Expandable section (only visible when role is `taxi`) with toggles for each document type

---

### App — Documents Screen

#### [MODIFY] [documents.tsx](file:///home/saikat/workspce/internship/vehical-assistant/zenvyGo/app/(main)/documents.tsx)

- When user role is `normal`: show a premium prompt card encouraging to switch to taxi mode
- When role is `taxi`: show existing document management as-is

---

### App — Auth Provider

#### [MODIFY] [AuthProvider.tsx](file:///home/saikat/workspce/internship/vehical-assistant/zenvyGo/providers/AuthProvider.tsx)

- No structural changes needed — [AuthUser](file:///home/saikat/workspce/internship/vehical-assistant/zenvyGo/lib/api.ts#19-30) type already flows through, the new `role` field will automatically propagate

---

### App — Localization

#### [MODIFY] [en.json](file:///home/saikat/workspce/internship/vehical-assistant/zenvyGo/locales/en.json)
#### [MODIFY] [ar.json](file:///home/saikat/workspce/internship/vehical-assistant/zenvyGo/locales/ar.json)

Add translation keys for role switching, document settings, and the role gate prompt.

---

## Verification Plan

### Automated Tests
- No existing test suite was found in the server project (only [supertest](file:///home/saikat/workspce/internship/vehical-assistant/server/node_modules/supertest) as a dependency). Manual API testing via the app is the primary verification method.

### Manual Verification
1. **Server**: After running migration, verify via MySQL that `role` and `document_visibility_settings` columns exist on `users`
2. **API**: Use the app Settings screen to switch role → confirm `GET /users/me` returns the updated role
3. **API**: Update document visibility settings → confirm `GET /users/me/document-settings` returns updated values
4. **App — Settings**: Open Settings → verify the "Role & Documents" section appears with toggle and document visibility checkboxes
5. **App — Documents**: With role=normal → confirm prompt card is shown; switch to taxi → confirm documents UI appears
6. **App — Documents**: Toggle visibility for a document type in settings → confirm the upload modal respects the setting
