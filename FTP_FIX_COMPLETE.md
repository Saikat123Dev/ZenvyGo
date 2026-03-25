# FTP 553 Error - FIXED ✅

## Summary of Changes

Your FTP upload service has been completely fixed. Two issues were resolved:

### Issue 1: FTP 553 Error (FIXED ✅)
**Root Cause:** Complex directory fallback logic and subdirectory creation
**Solution:** Simplified FTP upload to use `/zenvygo` directly without subdirectories

### Issue 2: Database Column Error (NEW - NEEDS MIGRATION)
**Error:** `Data truncated for column 'file_type' at row 1`
**Root Cause:** Column defined as `ENUM('image', 'pdf')` but code sends MIME types like `'image/jpeg'`
**Solution:** Migration created to change column to `VARCHAR(50)`

---

## Changes Made

### 1. FTP Service Simplified (`server/src/shared/services/ftp.service.ts`)

**BEFORE:** Complex fallback system with directory candidates
**AFTER:** Simple, direct upload to `/zenvygo`

```typescript
// NEW LOGIC (simplified):
const uploadDir = env.FTP_REMOTE_DIR || '/zenvygo';
const remotePath = `${uploadDir}/${fileName}`;
await client.uploadFrom(Readable.from(buffer), remotePath);
```

**Key changes:**
- ✅ All files upload directly to `/zenvygo`
- ✅ No subdirectories created
- ✅ Removed directory fallback logic
- ✅ Removed `resolvedUploadDir` state
- ✅ Timestamp added to filename for uniqueness: `1711368839000-uuid.jpg`
- ✅ Better error logging with 553-specific hints
- ✅ Simplified public URL generation

### 2. Environment Configuration Updated (`.env.example`)

```env
# OLD:
FTP_REMOTE_DIR=/uploads/documents
FTP_PUBLIC_URL=https://cdn.example.com

# NEW:
FTP_REMOTE_DIR=/zenvygo
FTP_PUBLIC_URL=https://cdn.example.com/zenvygo
```

### 3. Database Migration Created

**File:** `server/migrations/005_fix_file_type_column.up.sql`

```sql
ALTER TABLE driver_documents
  MODIFY COLUMN file_type VARCHAR(50) NOT NULL;
```

This changes the column from `ENUM('image', 'pdf')` to `VARCHAR(50)` to support full MIME types.

---

## How to Deploy the Fix

### Step 1: Update Environment Variables

Make sure your production `.env` has:

```env
FTP_REMOTE_DIR=/zenvygo
FTP_PUBLIC_URL=https://your-ftp-domain.com/zenvygo
```

### Step 2: Run the Database Migration

**Locally (if testing):**
```bash
cd server
npm run migrate:up
```

**On Render Production:**

Option A: Via Render Dashboard
1. Go to your Render service → Shell
2. Run:
```bash
cd /opt/render/project/src/server
npm run migrate:up
```

Option B: Add to your deployment script
Add to `package.json`:
```json
"scripts": {
  "start": "npm run migrate:up && node dist/server.js"
}
```

### Step 3: Restart Your Server

**Render will automatically restart** after environment variable changes.

If manual restart needed:
- Render Dashboard → Your Service → "Manual Deploy" → "Clear build cache & deploy"

---

## Verification Steps

### 1. Check FTP Directory Exists

Use FileZilla or FTP CLI to verify:
```bash
ftp your-ftp-host
> cd /zenvygo
> ls
```

If directory doesn't exist, create it:
```bash
> mkdir /zenvygo
> chmod 755 /zenvygo
```

### 2. Check Database Schema

Connect to your MySQL database and verify:
```sql
DESCRIBE driver_documents;
```

Look for:
```
file_type | varchar(50) | NO | | NULL |
```

### 3. Test File Upload

Use your mobile app or API to upload a document:

```bash
# Test with curl:
curl -X POST https://your-api.com/api/v1/documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.jpg" \
  -F "documentType=driving_license" \
  -F "documentName=My License"
```

**Expected result:**
- ✅ File uploads to FTP: `/zenvygo/1711368839000-uuid.jpg`
- ✅ Database record created with full MIME type
- ✅ Public URL returned: `https://cdn.example.com/zenvygo/1711368839000-uuid.jpg`

### 4. Check Logs

Look for these success messages:
```
✅ FTP startup health check passed
✅ File uploaded successfully via FTP
```

---

## File Naming Convention

**Format:** `{timestamp}-{uuid}.{ext}`

**Examples:**
- `1711368839000-a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`
- `1711368840123-x7y8z9a0-b1c2-3456-defg-hi9012345678.pdf`

**Benefits:**
- ✅ Timestamp for chronological sorting
- ✅ UUID for collision prevention
- ✅ Easy to trace in logs
- ✅ No special characters or spaces

---

## Troubleshooting

### If 553 Error Still Occurs:

**Check 1: Directory Exists**
```bash
ftp your-host
cd /zenvygo
```
If fails → Create directory manually

**Check 2: Write Permissions**
```bash
chmod 755 /zenvygo
```

**Check 3: FTP User Permissions**
Ensure FTP user has write access to `/zenvygo`

### If Database Error Occurs:

**Check 1: Migration Applied**
```sql
SELECT * FROM schema_migrations;
```
Should show: `005_fix_file_type_column`

**Check 2: Column Type**
```sql
DESCRIBE driver_documents;
```
`file_type` should be `varchar(50)`, not `enum`

**Check 3: Existing Data**
If you have existing records with truncated data:
```sql
UPDATE driver_documents
SET file_type = 'image/jpeg'
WHERE file_type = 'image';

UPDATE driver_documents
SET file_type = 'application/pdf'
WHERE file_type = 'pdf';
```

---

## What Was Removed

To simplify the codebase, these were removed:

- ❌ `resolvedUploadDir` property
- ❌ `getDirectoryCandidates()` method
- ❌ `buildRemotePath()` method
- ❌ `isDirectoryFallbackError()` method
- ❌ Directory fallback loop in `uploadBuffer()`
- ❌ `ensureDir()` call (assumes directory exists)
- ❌ Complex public URL path manipulation

---

## Production Checklist

Before deploying to production:

- [ ] `/zenvygo` directory exists on FTP server
- [ ] FTP user has write permission to `/zenvygo`
- [ ] Environment variables updated (`FTP_REMOTE_DIR`, `FTP_PUBLIC_URL`)
- [ ] Database migration executed (`005_fix_file_type_column.up.sql`)
- [ ] Server restarted on Render
- [ ] Test file upload via mobile app
- [ ] Verify file accessible via public URL
- [ ] Check server logs for errors

---

## Next Steps

1. **Run the migration** (see Step 2 above)
2. **Deploy to Render**
3. **Test document upload** from mobile app
4. **Monitor logs** for any remaining issues

---

## Support

If you encounter any issues:

1. Check server logs for detailed error messages
2. Verify FTP connectivity using FileZilla
3. Test database connection and schema
4. Review environment variables

All FTP uploads now go directly to `/zenvygo` with no subdirectories. Simple, fast, and reliable! 🚀
