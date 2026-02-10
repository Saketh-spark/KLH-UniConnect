# Video Playback Troubleshooting Guide

## Problem: Videos Not Playing

The Instagram-style Reels & Feed component shows the UI but videos don't play. Here's how to diagnose and fix:

## Quick Diagnostics

### 1. Check Browser Console (F12)
Look for these error types:
```
- CORS errors → Backend CORS configuration issue
- 404 errors → Video file not found on server
- Network errors → Backend server not running
- Video format errors → Unsupported video format
```

### 2. Test the API Directly
Open the debug dashboard: **REEL_API_DEBUG.html**
- Located at: `e:\KLH-uniconnect-1\KLH-uniconnect\REEL_API_DEBUG.html`
- Click "GET /api/reels" to check API response
- Look for `videoUrl` field in response

## Common Issues & Solutions

### Issue 1: API Returns No Data / Empty Array
**Symptoms**: Empty feed, "No reels found" message
**Cause**: No reels in database

**Solution**:
1. Open student dashboard
2. Click "Upload Reel" button
3. Fill in form and upload a test video
4. Refresh the reels feed

### Issue 2: API Returns Reels But No videoUrl
**Symptoms**: UI shows reels but videoUrl is null/undefined
**Cause**: Reel model not properly saving video URL

**Solution**:
Check the ReelController upload handler in backend:
```java
// File: backend/src/main/java/com/uniconnect/controller/ReelController.java
// Lines 40-45: Ensure videoUrl is properly set
String videoUrl = fileUploadService.uploadVideo(videoFile);
reel.setVideoUrl(videoUrl);  // <- Make sure this line exists
```

If missing, add it to the upload method.

### Issue 3: videoUrl Exists But Videos Won't Play
**Symptoms**: Video URL returned, but HTML5 video element shows black screen
**Possible Causes**:
- Video file not accessible at the URL path
- CORS headers not configured
- Video format not supported
- File permissions issue

**Solutions**:

**A. Check File Upload Service**
```java
// Verify upload service saves files correctly
// Should save to: /uploads/reels/ directory
// Should be accessible via: http://localhost:8085/uploads/reels/filename.mp4
```

**B. Enable CORS for Video Files**
```java
// Add to WebMvcConfigurer in backend
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:uploads/")
            .setCachePeriod(3600);
}
```

**C. Verify File Permissions**
Run in PowerShell on server:
```powershell
# Check if uploads folder exists
ls "E:\KLH-uniconnect-1\KLH-uniconnect\backend\uploads\reels\"

# Check file permissions
Get-Acl "E:\KLH-uniconnect-1\KLH-uniconnect\backend\uploads\reels\*.mp4"
```

**D. Test Direct Video Access**
Try opening in browser:
```
http://localhost:8085/uploads/reels/test-video.mp4
```
- Should either play or trigger download
- If 404, files not in correct location

### Issue 4: Videos Start But Don't Play After Navigation
**Symptoms**: First reel plays, but swiping to next reel shows black screen
**Cause**: Video component not properly resetting on state change

**Solution**: Already implemented - the component has:
- `key={currentIndex}` on video element (if needed, add it)
- Proper cleanup in useEffect

### Issue 5: CORS Error When Loading Video
**Symptoms**: Console shows "CORS error" or "Blocked by browser"
**Cause**: Backend not sending proper CORS headers

**Solution**:
```java
// Add to application.properties
cors.allowed-origins=http://localhost:5173,http://localhost:3000,http://localhost:8085
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allow-credentials=true
```

## Debugging Steps

### Step 1: Verify Backend is Running
```powershell
# Test backend connectivity
Invoke-WebRequest -Uri "http://localhost:8085/api/reels" `
  -Headers @{"X-Student-Id"="test"} | ConvertTo-Json
```

### Step 2: Check Database Has Reels
```javascript
// In browser console (F12), paste:
fetch('http://localhost:8085/api/reels', {
  headers: { 'X-Student-Id': 'student-123' }
})
.then(r => r.json())
.then(data => {
  console.log('Reels count:', data.length);
  console.log('First reel:', data[0]);
  console.log('Video URL:', data[0]?.videoUrl);
})
```

### Step 3: Test Video URL Accessibility
```javascript
// In browser console, test if video URL is reachable:
const url = 'http://localhost:8085/uploads/reels/video-file.mp4';
fetch(url)
  .then(r => {
    console.log('Status:', r.status);
    console.log('Headers:', r.headers);
  })
  .catch(e => console.error('Error:', e));
```

### Step 4: Check Video Format
```javascript
// Verify uploaded video format
// Open Developer Tools → Network tab
// Upload a video and check:
// 1. Request headers (multipart/form-data with correct field names)
// 2. Response (should include videoUrl)
```

## Solution Checklist

- [ ] Backend Spring Boot running on port 8085
- [ ] MongoDB database running and connected
- [ ] At least one reel exists in database
- [ ] Reel document has `videoUrl` field populated
- [ ] `/uploads/reels/` directory exists with video files
- [ ] Video file is readable (correct permissions)
- [ ] Video format is MP4, WebM, MOV, or AVI
- [ ] CORS headers configured on backend
- [ ] Frontend component has latest changes (with mock data fallback)
- [ ] Browser cache cleared (Ctrl+Shift+Delete)

## Test Video (Using in Mock Data)

The component includes a fallback to this test video:
```
https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4
```

If this plays in the "No reels" state, the issue is with your uploaded videos, not the player.

## WebSocket Real-Time Sync

Ensure WebSocket connection works:
```javascript
// In browser console:
const ws = new WebSocket('ws://localhost:8085/ws/reels?userId=student-123&role=STUDENT');
ws.onopen = () => console.log('Connected!');
ws.onerror = (e) => console.error('Error:', e);
ws.onmessage = (e) => console.log('Message:', e.data);
```

## File Upload Implementation

Current implementation:
```javascript
// frontend/src/components/InstagramStyleUploadModal.jsx
// Uploads to: POST /api/reels/upload
// With FormData containing: video (File), title, description, category, etc.
```

Backend handler:
```java
// backend/src/main/java/com/uniconnect/controller/ReelController.java
@PostMapping("/upload")
public ResponseEntity<Map<String, Object>> uploadFiles(
    @RequestParam("video") MultipartFile videoFile,
    @RequestParam("title") String title,
    // ... other params
) {
    String videoUrl = fileUploadService.uploadVideo(videoFile);
    // Save to Reel model and database
}
```

## Advanced Debugging

### Enable Backend Logging
Add to `application.properties`:
```properties
logging.level.com.uniconnect.controller=DEBUG
logging.level.com.uniconnect.service=DEBUG
spring.jpa.show-sql=true
```

Then check console logs when uploading/fetching reels.

### Monitor Network Requests
In Browser DevTools:
1. Open Network tab
2. Upload a reel
3. Check POST request:
   - Status should be 201 or 200
   - Response should include `videoUrl`
4. Refresh page
5. Check GET /api/reels request:
   - Status should be 200
   - Response should include all reels with `videoUrl`

### Check File System
```powershell
# Navigate to uploads folder
cd "E:\KLH-uniconnect-1\KLH-uniconnect\backend\uploads\reels\"

# List all files
ls -R

# Check file size
(ls *.mp4 | Measure-Object -Property Length -Sum).Sum
```

## Expected Behavior After Fix

1. ✅ Page loads with Instagram-style UI
2. ✅ Video plays automatically (if autoplay not blocked by browser)
3. ✅ Right-side action bar works (like, comment, save)
4. ✅ Bottom overlay shows user, title, tags
5. ✅ Swipe up/down navigates to next/prev reel
6. ✅ Double-tap to like
7. ✅ Tap to pause/play
8. ✅ Faculty feedback displays with rating

## Contact & Support

If issue persists:
1. Check logs: Browser Console (F12) and Backend Console
2. Run REEL_API_DEBUG.html dashboard
3. Verify all items in checklist above
4. Check database directly for reel documents
5. Test with mock video (BigBuckBunny.mp4) to isolate issue

---

**Last Updated**: January 6, 2026
