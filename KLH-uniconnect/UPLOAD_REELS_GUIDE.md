# Upload Reels - Complete Implementation Guide

## Overview
Fully functional reel upload system with video/thumbnail upload, validation, and MongoDB integration.

## Backend Components

### 1. FileUploadService
Handles file uploads with validation.

**Location**: `src/main/java/com/uniconnect/service/FileUploadService.java`

**Features**:
- Video upload (MP4, MOV, AVI, MPEG)
- Thumbnail upload (JPG, PNG, WebP)
- File size validation (max 500MB)
- MIME type validation
- Unique filename generation
- Base64 encoding support

**Max File Size**: 500MB per file

**Supported Formats**:
- **Video**: MP4, MPEG, MOV, AVI
- **Thumbnail**: JPEG, PNG, WebP

### 2. ReelController
Updated with file upload endpoint.

**New Endpoint**:
```
POST /api/reels/upload
```

**Request**:
```
Content-Type: multipart/form-data
Headers:
  - X-Student-Id: string (required)

Form Data:
  - video: File (required) - Video file
  - thumbnail: File (optional) - Thumbnail image
```

**Response**:
```json
{
  "success": true,
  "videoUrl": "/uploads/reels/uuid.mp4",
  "thumbnailUrl": "/uploads/reels/uuid.png"
}
```

### 3. Application Configuration
Updated `application.properties` to support file uploads:

```properties
spring.servlet.multipart.max-file-size=500MB
spring.servlet.multipart.max-request-size=500MB
spring.web.resources.static-locations=file:uploads/,classpath:/static/
```

## Frontend Components

### 1. UploadReelModal Component
**Location**: `src/components/UploadReelModal.jsx`

**Features**:
- Drag-and-drop file upload
- Video preview
- Thumbnail selection
- Form validation
- Progress tracking (0-100%)
- Error messages
- Success confirmation

**Props**:
```javascript
{
  isOpen: boolean,           // Modal visibility
  onClose: function,         // Close modal callback
  studentId: string,         // Current student ID
  onSuccess: function        // Success callback
}
```

### 2. ReelsAndFeed Integration
Updated to include upload modal trigger.

**Features**:
- Upload button in header
- Modal opens on button click
- Authentication check
- Auto-refresh after upload

## Upload Workflow

### Step 1: File Selection
User selects video and optional thumbnail via file input.

### Step 2: Validation
- File size checked (max 500MB)
- MIME type validated
- Form fields required:
  - Title (1-100 chars)
  - Description (1-500 chars)
  - Category (required)
  - Hashtags (optional, comma-separated)

### Step 3: File Upload
POST to `/api/reels/upload` with multipart form data.
- Files saved to `uploads/reels/` directory
- Unique filenames generated with UUIDs

### Step 4: Reel Creation
POST to `/api/reels/create` with reel metadata:
- Title, description, category
- Video and thumbnail URLs
- Hashtags parsed from comma-separated input

### Step 5: Success
- Modal shows success message
- Form resets
- User redirected to reels feed
- New reel appears in feed

## API Endpoints

### Upload Files
```
POST /api/reels/upload
X-Student-Id: {studentId}
Content-Type: multipart/form-data

video: File (required)
thumbnail: File (optional)
```

**Response**:
```json
{
  "success": true,
  "videoUrl": "/uploads/reels/abc123.mp4",
  "thumbnailUrl": "/uploads/reels/abc456.png"
}
```

### Create Reel
```
POST /api/reels/create
X-Student-Id: {studentId}
Content-Type: application/json

{
  "title": "My Reel",
  "description": "Description here",
  "videoUrl": "/uploads/reels/abc123.mp4",
  "thumbnailUrl": "/uploads/reels/abc456.png",
  "category": "Project",
  "hashtags": ["#coding", "#tutorial"]
}
```

## Error Handling

### Validation Errors
- No video file selected → "Please select a video file"
- No title → "Please enter a title"
- No description → "Please enter a description"
- File too large → "File size must be less than 500MB"
- Invalid format → "Please upload a valid video format (MP4, MOV, AVI, MPEG)"

### Upload Errors
- Network error → "Upload failed. Please try again."
- Server error → "File upload failed: [error message]"

## File Storage

### Directory Structure
```
project-root/
├── uploads/
│   └── reels/
│       ├── uuid1.mp4
│       ├── uuid2.png
│       ├── uuid3.mp4
│       └── ...
```

### File Access
Files are served through Spring's static resources:
- URL: `http://localhost:8085/uploads/reels/filename.ext`
- Served from: `uploads/reels/` directory

## Usage Example

### Frontend
```javascript
import ReelsAndFeed from './components/ReelsAndFeed';

<ReelsAndFeed 
  onBack={() => navigate('/')}
  studentId={currentStudentId}
/>

// Click "Upload Reel" button → Modal opens
// Select video file → Optional thumbnail → Fill form → Upload
```

### Complete Upload Flow
```
1. Click "Upload Reel" button
2. Select video file (MP4, MOV, AVI, MPEG)
3. Optionally select thumbnail (JPG, PNG, WebP)
4. Enter reel details:
   - Title (max 100 chars)
   - Description (max 500 chars)
   - Category (dropdown)
   - Hashtags (comma-separated)
5. Click "Upload Reel"
6. Progress bar shows upload status
7. Success message appears
8. Modal closes automatically
9. New reel appears in feed
```

## Configuration Options

### Max File Size
Edit `application.properties`:
```properties
spring.servlet.multipart.max-file-size=500MB
spring.servlet.multipart.max-request-size=500MB
```

### Upload Directory
Edit `FileUploadService.java`:
```java
private static final String UPLOAD_DIR = "uploads/reels";
```

### Allowed File Types
Edit `FileUploadService.java`:
```java
private static final String[] ALLOWED_VIDEO_TYPES = {
  "video/mp4", 
  "video/mpeg", 
  "video/quicktime", 
  "video/x-msvideo"
};

private static final String[] ALLOWED_IMAGE_TYPES = {
  "image/jpeg", 
  "image/png", 
  "image/webp"
};
```

## Production Considerations

### Recommendations
1. **Cloud Storage**: Use AWS S3, Azure Blob Storage, or Google Cloud Storage for scalability
2. **CDN**: Serve media through CDN for faster access
3. **Compression**: Compress videos before storage
4. **Validation**: Additional server-side validation
5. **Virus Scanning**: Scan uploaded files for malware
6. **Rate Limiting**: Limit uploads per user
7. **Storage Cleanup**: Delete old/unused files

### Example: AWS S3 Integration
```java
// Instead of local file storage:
AmazonS3 s3Client = AmazonS3ClientBuilder.standard().build();
s3Client.putObject(bucketName, fileName, file.getInputStream(), null);
String url = s3Client.getUrl(bucketName, fileName).toString();
```

## Testing

### Manual Testing
1. **Valid Upload**:
   - Select MP4 file < 500MB
   - Fill all required fields
   - Click upload
   - Verify file created in `uploads/reels/`
   - Verify reel appears in feed

2. **Error Cases**:
   - Upload without title → Error message
   - Upload file > 500MB → Error message
   - Upload non-video file → Error message
   - Network timeout → Error message

### API Testing (cURL)
```bash
# Upload files
curl -X POST http://localhost:8085/api/reels/upload \
  -H "X-Student-Id: student123" \
  -F "video=@video.mp4" \
  -F "thumbnail=@thumb.png"

# Create reel
curl -X POST http://localhost:8085/api/reels/create \
  -H "X-Student-Id: student123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Reel",
    "description": "Test",
    "videoUrl": "/uploads/reels/abc.mp4",
    "thumbnailUrl": "/uploads/reels/thumb.png",
    "category": "Project",
    "hashtags": ["#test"]
  }'
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "File upload failed" | Check file size (< 500MB) and format |
| Files not served | Ensure `uploads/` directory exists and is readable |
| 500 error on upload | Check server logs and file permissions |
| Slow uploads | Use cloud storage like S3 instead of local |
| Modal won't close | Check browser console for JS errors |

## Performance Notes

- **Video Encoding**: Consider pre-processing videos for streaming
- **Thumbnail Generation**: Auto-generate thumbnail from video
- **Chunked Upload**: For very large files, implement chunked upload
- **Async Processing**: Move to background job queue for slow uploads

## Security Notes

- ✅ File type validation (MIME type check)
- ✅ File size limits enforced
- ✅ Unique filename generation (no name collisions)
- ✅ Student ID authentication required
- ✅ CORS configured
- ⚠️ Add: Virus scanning for production
- ⚠️ Add: Rate limiting per user
- ⚠️ Add: Encryption for sensitive content
