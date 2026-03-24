# Driver Document Management System - Implementation Plan

## Overview
Implement a comprehensive document management system where drivers can upload their documents (DL, RC, PUC, Insurance, etc.) and control visibility for passengers who scan their QR code.

---

## Phase 1: Database Schema (Server)

### New Migration: `003_driver_documents.up.sql`

```sql
CREATE TABLE IF NOT EXISTS driver_documents (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  document_type ENUM('driving_license', 'vehicle_registration', 'puc_certificate', 'insurance', 'other') NOT NULL,
  document_name VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(20) NOT NULL,  -- 'image/jpeg', 'image/png', 'application/pdf'
  expiry_date DATE NULL,
  status ENUM('pending', 'verified') NOT NULL DEFAULT 'pending',
  is_visible_to_passenger TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_driver_documents_user
    FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_driver_documents_user (user_id),
  INDEX idx_driver_documents_type (document_type),
  INDEX idx_driver_documents_visible (is_visible_to_passenger)
);

-- Add driver profile fields to users table
ALTER TABLE users
  ADD COLUMN profile_photo_url TEXT NULL AFTER name,
  ADD COLUMN is_driver TINYINT(1) NOT NULL DEFAULT 0 AFTER profile_photo_url;
```

---

## Phase 2: FTP Upload Service (Server)

### Files to create:
1. `server/src/shared/services/ftp.service.ts` - FTP connection and upload logic
2. `server/src/shared/config/ftp.config.ts` - FTP configuration from env

### FTP Service Features:
- Connect to FTP server
- Upload file with unique name (UUID-based)
- Return public URL after upload
- Support image resize/compression before upload (optional)
- Handle connection pooling/retry

### Environment Variables to add:
```
FTP_HOST=
FTP_PORT=21
FTP_USER=
FTP_PASSWORD=
FTP_BASE_PATH=/uploads/documents
FTP_PUBLIC_URL=https://files.example.com
```

---

## Phase 3: Documents Module (Server)

### Files to create:
1. `server/src/modules/documents/document.repository.ts`
2. `server/src/modules/documents/document.service.ts`
3. `server/src/modules/documents/document.routes.ts`
4. `server/src/modules/documents/document.schemas.ts`
5. `server/src/modules/documents/index.ts`

### API Endpoints:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/documents` | Yes | List all documents for logged-in user |
| POST | `/api/v1/documents/upload` | Yes | Upload a new document (multipart/form-data) |
| PATCH | `/api/v1/documents/:id` | Yes | Update document (name, expiry, visibility) |
| DELETE | `/api/v1/documents/:id` | Yes | Soft delete a document |
| PATCH | `/api/v1/documents/:id/visibility` | Yes | Toggle visibility for passenger |
| GET | `/api/v1/public/driver-profile/:token` | No | Get driver profile + visible documents by QR token |

### Document Upload Flow:
1. Receive multipart form data (file + metadata)
2. Validate file type (image/pdf) and size (<5MB)
3. Upload to FTP server
4. Save metadata to database
5. Return document record

---

## Phase 4: Driver Profile Public API (Server)

### Update `tag.service.ts`:
Add method to get driver profile with visible documents when QR is scanned.

### New Response for `/api/v1/public/driver-profile/:token`:
```typescript
interface PublicDriverProfile {
  driverName: string | null;
  profilePhotoUrl: string | null;
  vehicleNumber: string;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleColor: string | null;
  vehicleYear: number | null;
  documents: {
    type: string;
    name: string;
    fileUrl: string;
    expiryDate: string | null;
  }[];
  // For contact request flow
  tagId: string;
  allowedReasonCodes: string[];
  allowedChannels: string[];
}
```

---

## Phase 5: Mobile App - Image Picker Setup

### Install expo-image-picker:
```bash
cd zenvyGo && npx expo install expo-image-picker
```

### Create upload utility:
`zenvyGo/lib/upload.ts` - Helper to pick image and upload to server

---

## Phase 6: Mobile App - Documents Screen

### Create new screen:
`zenvyGo/app/(main)/documents.tsx`

### Features:
- List all uploaded documents with cards
- Each card shows: Document type icon, name, expiry date, status badge, visibility toggle
- FAB button to add new document
- Upload modal with:
  - Document type picker (DL, RC, PUC, Insurance, Other)
  - Image picker button
  - Expiry date picker (optional)
  - Custom name input
- Swipe to delete
- Pull to refresh

### UI Components needed:
- `DocumentCard` - Display single document with toggle
- `DocumentUploadModal` - Modal for uploading new document
- `DocumentTypeSelector` - Picker for document types

---

## Phase 7: Mobile App - Visibility Settings

### Add to Settings screen or create new section:
`Document Visibility & Sharing` section in profile/settings

### Features:
- Quick toggles for all documents
- "Preview as Passenger" button - shows what passenger will see
- Link to documents screen for full management

---

## Phase 8: Mobile App - Enhanced Passenger View

### Update scan flow in `zenvyGo/app/(main)/scan.tsx`:

After QR scan, before contact form, show:

```
┌─────────────────────────────────────┐
│  [Driver Photo]                     │
│  Driver Name                        │
│  ────────────────────────────────   │
│  🚗 Vehicle: MH12AB1234             │
│     Toyota Camry (White, 2023)      │
│  ────────────────────────────────   │
│  📞 Call Driver    🚨 Emergency     │
│  ────────────────────────────────   │
│  📄 DOCUMENTS                       │
│  ┌─────────────────────────────┐   │
│  │ 🪪 Driving License          │   │
│  │    Valid till: Dec 2025     │   │
│  │    [View]                   │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 📋 PUC Certificate          │   │
│  │    Valid till: Mar 2025     │   │
│  │    [View]                   │   │
│  └─────────────────────────────┘   │
│  ────────────────────────────────   │
│  [Contact Owner Button]            │
└─────────────────────────────────────┘
```

---

## Phase 9: Navigation Updates

### Update `zenvyGo/app/(main)/_layout.tsx`:
- Add `documents` screen (hidden from tabs, accessible via profile)

### Update `zenvyGo/app/(main)/profile.tsx`:
- Add "My Documents" menu item
- Add document stats (X documents, Y visible)

---

## Phase 10: API Service Updates

### Update `zenvyGo/lib/api.ts`:

Add new methods:
```typescript
// Documents
listDocuments(): Promise<ApiResponse<Document[]>>
uploadDocument(formData: FormData): Promise<ApiResponse<Document>>
updateDocument(id: string, data: UpdateDocumentInput): Promise<ApiResponse<Document>>
deleteDocument(id: string): Promise<ApiResponse<void>>
toggleDocumentVisibility(id: string, visible: boolean): Promise<ApiResponse<Document>>

// Public
getDriverProfile(token: string): Promise<ApiResponse<PublicDriverProfile>>
```

---

## File Structure Summary

### Server (new files):
```
server/
├── migrations/
│   └── 003_driver_documents.up.sql
│   └── 003_driver_documents.down.sql
├── src/
│   ├── modules/
│   │   └── documents/
│   │       ├── index.ts
│   │       ├── document.repository.ts
│   │       ├── document.service.ts
│   │       ├── document.routes.ts
│   │       └── document.schemas.ts
│   └── shared/
│       └── services/
│           └── ftp.service.ts
```

### Mobile App (new/modified files):
```
zenvyGo/
├── app/(main)/
│   ├── documents.tsx (NEW)
│   ├── _layout.tsx (MODIFY - add documents screen)
│   ├── profile.tsx (MODIFY - add documents link)
│   ├── scan.tsx (MODIFY - show driver profile)
│   └── settings.tsx (MODIFY - add visibility section)
├── components/
│   └── documents/
│       ├── DocumentCard.tsx (NEW)
│       ├── DocumentUploadModal.tsx (NEW)
│       └── DriverProfileView.tsx (NEW)
├── lib/
│   ├── api.ts (MODIFY - add document APIs)
│   └── upload.ts (NEW - image picker helper)
└── store/
    └── app-store.ts (MODIFY - add documents state)
```

---

## Implementation Order

1. **Server Phase 1-2**: Database migration + FTP service
2. **Server Phase 3-4**: Documents module + public API
3. **Mobile Phase 5**: Image picker setup
4. **Mobile Phase 6**: Documents screen
5. **Mobile Phase 7**: Visibility settings
6. **Mobile Phase 8**: Enhanced passenger view
7. **Mobile Phase 9-10**: Navigation + API updates
8. **Testing**: End-to-end testing

---

## Security Considerations

1. **File validation**: Check MIME type, not just extension
2. **File size limit**: Max 5MB per document
3. **Access control**: Only document owner can update/delete
4. **Public access**: Only visible documents shown after QR scan
5. **FTP security**: Use FTPS/SFTP if available
6. **URL security**: Consider signed URLs for document access (future enhancement)

---

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Database Migration | 30 min |
| FTP Service | 1-2 hours |
| Documents Module (Server) | 2-3 hours |
| Public API Updates | 1 hour |
| Image Picker Setup | 30 min |
| Documents Screen (Mobile) | 3-4 hours |
| Visibility Settings | 1 hour |
| Enhanced Passenger View | 2-3 hours |
| Navigation + API Updates | 1 hour |
| Testing | 2 hours |

**Total: ~15-18 hours**
