# FTP Upload Fix - 553 Error Resolution

**Date:** March 25, 2026
**Issue:** FTP 553 "Could not create file" error in production
**Root Cause:** Complex directory candidate system trying to create/access subdirectories without proper permissions

---

## 🔧 Changes Made

### 1. Simplified Upload Logic

**BEFORE:**
- Complex directory candidate fallback system
- Attempted to create directories with `ensureDir()`
- Multiple path variations tried sequentially
- Subdirectories based on file types

**AFTER:**
- Direct upload to configured directory (`/zenvygo`)
- NO subdirectories - all files in one location
- NO directory creation attempts - assumes directory exists
- Simple, fast, and reliable

---

## 📝 Updated Files

### 1. `/server/src/shared/services/ftp.service.ts`

**Removed:**
- ❌ `resolvedUploadDir` field
- ❌ `getDirectoryCandidates()` method
- ❌ `buildRemotePath()` method
- ❌ `isDirectoryFallbackError()` method
- ❌ Complex directory fallback logic
- ❌ `ensureDir()` calls

**Added:**
- ✅ Simplified `uploadBuffer()` method
- ✅ Direct path construction: `/zenvygo/timestamp-uuid.ext`
- ✅ Enhanced logging with detailed error hints
- ✅ Timestamp prefix for additional uniqueness
- ✅ Clear 553 error message with actionable hint

**Updated:**
- ✅ `runStartupHealthCheck()` - simpler directory verification
- ✅ `buildPublicFileUrl()` - direct filename append

---

### 2. `/server/.env.example`

**Updated Configuration:**
```env
FTP_REMOTE_DIR=/zenvygo
FTP_PUBLIC_URL=https://cdn.example.com/zenvygo
```

**Removed:**
- ❌ `FTP_BASE_PATH` (no longer needed)

---

## 🚀 How It Works Now

### File Upload Flow:

1. **Request arrives** → Document upload endpoint receives file
2. **Validation** → File type and size checked
3. **Filename generation** → `{timestamp}-{uuid}.{ext}`
   - Example: `1711372800000-a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`
4. **Remote path** → `/zenvygo/{filename}`
5. **Upload** → Direct FTP upload to full path
6. **Public URL** → `https://cdn.example.com/zenvygo/{filename}`

### Example:

**Input:**
- File: `drivers_license.jpg`
- MIME: `image/jpeg`
- Size: 2.3 MB

**Processing:**
- Generated filename: `1711372800000-uuid-here.jpg`
- Remote path: `/zenvygo/1711372800000-uuid-here.jpg`
- Public URL: `https://cdn.example.com/zenvygo/1711372800000-uuid-here.jpg`

**Database Record:**
```json
{
  "file_url": "https://cdn.example.com/zenvygo/1711372800000-uuid-here.jpg",
  "file_type": "image/jpeg",
  "original_filename": "drivers_license.jpg",
  "file_size_bytes": 2411520
}
```

---

## ✅ Pre-Deployment Checklist

### 1. FTP Server Setup

**CRITICAL:** Ensure the directory exists on your FTP server:

```bash
# Connect to FTP manually (use FileZilla or CLI)
ftp your-server.com
> cd /
> mkdir zenvygo
> chmod 755 zenvygo
> cd zenvygo
> pwd
# Should show: /zenvygo
```

### 2. Environment Variables

Update your production `.env`:

```env
FTP_REMOTE_DIR=/zenvygo
FTP_PUBLIC_URL=https://your-cdn-domain.com/zenvygo
```

⚠️ **Important:** Remove the old `FTP_BASE_PATH` variable if present.

### 3. Test Upload (Local)

```bash
cd server
npm run dev
```

Use Postman or mobile app to upload a test document.

**Check logs for:**
```
Starting FTP upload
  fileName: 1711372800000-uuid.jpg
  remotePath: /zenvygo/1711372800000-uuid.jpg
  uploadDir: /zenvygo
  bufferSize: 2411520
```

### 4. Verify Public Access

After upload, test the public URL:

```bash
curl -I https://your-cdn-domain.com/zenvygo/1711372800000-uuid.jpg
# Should return: 200 OK
```

---

## 🐛 Troubleshooting

### Error: "553 Could not create file"

**Cause:** Directory doesn't exist or no write permission

**Fix:**
1. Manually create `/zenvygo` directory on FTP server
2. Set permissions: `chmod 755 /zenvygo`
3. Verify FTP user has write access

---

### Error: "530 Login authentication failed"

**Cause:** Wrong FTP credentials

**Fix:**
1. Check `FTP_USER` and `FTP_PASSWORD` in `.env`
2. If password contains `#` or special chars, wrap in quotes:
   ```env
   FTP_PASSWORD="myp@ss#word"
   ```

---

### Error: "Public URL returns 404"

**Cause:** `FTP_PUBLIC_URL` doesn't match actual server path

**Fix:**
1. Verify your FTP server's public web path
2. Update `FTP_PUBLIC_URL` to match
3. Example mapping:
   - FTP path: `/zenvygo/file.jpg`
   - Web path: `https://cdn.example.com/zenvygo/file.jpg`

---

### Startup Health Check Fails

**Logs show:** "FTP startup health check failed"

**Fix:**
1. Verify FTP connection details
2. Manually test FTP access with FileZilla
3. Check if `/zenvygo` directory exists
4. Review logs for specific error message

---

## 📊 Benefits of New Approach

| Aspect | Before | After |
|--------|--------|-------|
| **Complexity** | High (fallback system) | Low (direct upload) |
| **Speed** | Slower (multiple attempts) | Fast (single attempt) |
| **Reliability** | Medium (can fail silently) | High (clear error messages) |
| **Debugging** | Hard (complex logs) | Easy (simple logs) |
| **File Organization** | Subdirectories | Flat structure |
| **Permission Issues** | Common (ensureDir fails) | Rare (assumes dir exists) |

---

## 🔍 Code Comparison

### BEFORE: uploadBuffer()

```typescript
// Complex fallback logic
const directoryCandidates = this.getDirectoryCandidates(env.FTP_REMOTE_DIR);
for (const dir of orderedCandidates) {
  try {
    if (dir !== '.') {
      await client.ensureDir(dir); // ❌ Can fail with 553
    }
    await client.uploadFrom(Readable.from(buffer), remotePath);
    // ... success
  } catch (error) {
    // Try next candidate...
  }
}
```

### AFTER: uploadBuffer()

```typescript
// Simple direct upload
const uploadDir = env.FTP_REMOTE_DIR || '/zenvygo';
const remotePath = `${uploadDir}/${fileName}`;

await client.uploadFrom(Readable.from(buffer), remotePath); // ✅ Direct upload
```

---

## 🎯 Testing Scenarios

### Test 1: Upload Driving License

```bash
POST /api/v1/documents
Content-Type: multipart/form-data

documentType: driving_license
documentName: "John Doe License"
file: [driving_license.jpg]
```

**Expected:**
- ✅ File uploaded to `/zenvygo/timestamp-uuid.jpg`
- ✅ Database record created
- ✅ Public URL accessible

---

### Test 2: Upload Vehicle RC

```bash
POST /api/v1/documents
Content-Type: multipart/form-data

documentType: rc
vehicleId: "vehicle-uuid-here"
documentName: "Tesla Model S RC"
file: [rc_document.pdf]
```

**Expected:**
- ✅ PDF uploaded to `/zenvygo/timestamp-uuid.pdf`
- ✅ Linked to vehicle
- ✅ Visibility toggle works

---

### Test 3: Large File (5MB)

```bash
POST /api/v1/documents
Content-Type: multipart/form-data

documentType: insurance
vehicleId: "vehicle-uuid"
file: [5mb_insurance.jpg]
```

**Expected:**
- ✅ Upload succeeds (under 5MB limit)
- ✅ File accessible via public URL

---

### Test 4: Invalid File Type

```bash
POST /api/v1/documents
Content-Type: multipart/form-data

documentType: insurance
file: [document.zip]
```

**Expected:**
- ❌ Error: "Invalid file type. Allowed types: JPEG, PNG, WebP, PDF"
- ❌ No FTP upload attempted

---

## 📈 Monitoring

### Key Metrics to Track:

1. **Upload Success Rate**
   - Target: > 99%
   - Alert if < 95%

2. **Average Upload Time**
   - Target: < 3 seconds
   - Alert if > 10 seconds

3. **FTP Connection Errors**
   - Target: 0 per day
   - Alert on any 530 (auth) or 553 (permission) errors

4. **Public URL Accessibility**
   - Target: 100%
   - Alert if 404 errors detected

---

## 🔐 Security Considerations

### Current Implementation:

✅ **Secure Filename Generation**
- Timestamp + UUID = unpredictable filename
- Original filename not exposed in URL

✅ **File Type Validation**
- Only allows: JPEG, PNG, WebP, PDF
- Prevents malicious file uploads

✅ **Size Limits**
- Max 5MB prevents abuse
- Protects FTP storage quota

✅ **Visibility Control**
- Driver can toggle document visibility
- Public API respects `is_visible_to_passenger` flag

### Recommendations:

⚠️ **Add CDN/Cloudflare**
- DDoS protection
- Faster global access
- Cache uploaded files

⚠️ **Migrate to S3/Cloudinary**
- More reliable than FTP
- Better scalability
- Built-in CDN
- Lower maintenance

---

## 📅 Migration Path to Cloud Storage (Future)

If FTP continues to cause issues, consider:

### Option 1: AWS S3

**Pros:**
- Industry standard
- 99.999999999% durability
- Integrated CDN (CloudFront)
- Pay-as-you-go pricing

**Integration:**
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

await s3.send(new PutObjectCommand({
  Bucket: 'zenvygo-documents',
  Key: fileName,
  Body: buffer,
  ContentType: mimeType,
}));
```

### Option 2: Cloudinary

**Pros:**
- Image optimization built-in
- Automatic format conversion
- Simple API
- Free tier available

**Integration:**
```typescript
import { v2 as cloudinary } from 'cloudinary';

const result = await cloudinary.uploader.upload_stream({
  folder: 'documents',
  resource_type: 'auto',
});
```

### Option 3: Supabase Storage

**Pros:**
- Simple API
- PostgreSQL-based
- Good pricing
- Built-in CDN

**Integration:**
```typescript
import { createClient } from '@supabase/supabase-js';

const { data, error } = await supabase.storage
  .from('documents')
  .upload(fileName, buffer);
```

---

## ✅ Deployment Steps

### Step 1: Commit Changes

```bash
git add server/src/shared/services/ftp.service.ts server/.env.example
git commit -m "fix: simplify FTP upload to direct /zenvygo directory

- Remove complex directory candidate fallback system
- Upload all files directly to /zenvygo without subdirectories
- Improve error logging with actionable hints
- Fix 553 permission errors by avoiding ensureDir calls
- Add timestamp prefix to filenames for uniqueness"
```

### Step 2: Prepare FTP Server

1. SSH/FTP into your server
2. Create directory: `mkdir /zenvygo`
3. Set permissions: `chmod 755 /zenvygo`
4. Test write access

### Step 3: Update Environment

Update production `.env`:

```env
FTP_REMOTE_DIR=/zenvygo
FTP_PUBLIC_URL=https://your-cdn.com/zenvygo
```

### Step 4: Deploy to Render

```bash
git push origin main
# Render auto-deploys
```

### Step 5: Monitor Logs

```bash
# Watch Render logs for:
# - "FTP startup health check passed"
# - "File uploaded successfully via FTP"
```

### Step 6: Test Upload

1. Open mobile app
2. Go to Documents
3. Upload test document
4. Verify:
   - Upload succeeds
   - Public URL accessible
   - File displays correctly

---

## 🎉 Expected Results

After deployment:

✅ **No more 553 errors**
✅ **Faster uploads** (no fallback attempts)
✅ **Clearer logs** (easier debugging)
✅ **Simplified codebase** (less complexity)
✅ **Better reliability** (single path, clear errors)

---

## 📞 Support

If issues persist after deployment:

1. **Check FTP server logs** for permission errors
2. **Verify directory exists** and has correct permissions
3. **Test FTP connection manually** with FileZilla
4. **Review Render deployment logs** for startup errors
5. **Check environment variables** are set correctly

---

## 📚 Related Documentation

- FTP Service: `/server/src/shared/services/ftp.service.ts`
- Document Service: `/server/src/modules/documents/document.service.ts`
- Environment Config: `/server/src/shared/config/env.ts`
- Comprehensive Analysis: `/COMPREHENSIVE_ANALYSIS.md`

---

**Last Updated:** March 25, 2026
**Version:** 2.0 (Simplified FTP)
**Status:** ✅ Ready for Production
