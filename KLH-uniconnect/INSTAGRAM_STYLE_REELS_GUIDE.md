# Instagram-Style Reels & Feed Module - Complete Implementation Guide

## Overview

This document covers the complete redesign of the Reels & Feed module with Instagram-like UI while maintaining academic and professional purposes. The system includes full-screen vertical reel view, swipe navigation, real-time synchronization between student and faculty portals, and comprehensive feedback mechanisms.

## Architecture

### Frontend Components

#### 1. **InstagramStyleReelsFeed.jsx** (Student Portal)
- **Purpose**: Main student reel viewing interface
- **Location**: `frontend/src/components/InstagramStyleReelsFeed.jsx`

**Key Features**:
- Full-screen vertical (9:16) reel view
- Swipe up/down navigation with smooth transitions
- Double-tap to like with visual feedback
- Right-side vertical action bar (Like, Comment, Share, Save, More)
- Bottom overlay showing user info, caption, tags, category
- Search and category filtering
- Tab navigation (Feed, My Reels, Saved)
- Real-time WebSocket synchronization
- Auto-play/pause on tap
- Infinite scroll capability
- Reel counter showing current position

**Props**:
```javascript
{
  studentId: string,        // Required: Student ID from auth
  onBack: function,         // Callback when back button pressed
  onRequireSignIn: function // Callback when sign-in needed
}
```

**State Management**:
```javascript
{
  reels: [],                    // Array of reel objects
  currentIndex: number,         // Current reel position
  loading: boolean,
  searchQuery: string,
  selectedCategory: string,
  showSearch: boolean,
  showFilters: boolean,
  commentModalOpen: boolean,
  commentText: string,
  likedReels: Set<reelId>,
  savedReels: Set<reelId>,
  isPlaying: boolean,           // Video play/pause state
  showOptions: null | reelIndex // Context menu visibility
}
```

**API Endpoints Called**:
- `GET /api/reels` - Load reels (filtered by category/search)
- `POST /api/reels/{reelId}/like` - Like a reel
- `POST /api/reels/{reelId}/unlike` - Unlike a reel
- `POST /api/reels/{reelId}/save` - Save a reel
- `POST /api/reels/{reelId}/unsave` - Unsave a reel
- `POST /api/reels/{reelId}/comment` - Add comment

**WebSocket Events**:
- Subscribe: `SUBSCRIBE_REEL`
- Receive: `NOTIFICATION`, `REEL_UPDATE`
- Actions trigger broadcast: Like, Comment, Faculty feedback

#### 2. **InstagramStyleFacultyReelsFeed.jsx** (Faculty Portal)
- **Purpose**: Faculty reel review and moderation interface
- **Location**: `frontend/src/components/InstagramStyleFacultyReelsFeed.jsx`

**Key Features**:
- Same Instagram-style full-screen UI
- Tab navigation: Review Queue, All Reels, My Guidance
- Advanced filtering: Department, Subject, Skill, Year
- Faculty action buttons:
  - **Approve**: Mark reel as academically sound (Status: APPROVED)
  - **Flag**: Mark for further review (Status: FLAGGED)
  - **Feedback**: Submit detailed academic feedback with rating
  - **Mark Placement Ready**: Indicate placement readiness
  - **Share**: Share with Class, Department, or Placement Cell
- Status badge display (PENDING, APPROVED, FLAGGED)
- Placement readiness indicator
- Student engagement metrics (views, likes, comments)
- Long-press context menu with share options
- Real-time sync with student actions

**Props**:
```javascript
{
  facultyId: string,        // Required: Faculty ID from auth
  onBack: function,         // Callback when back button pressed
  onRequireSignIn: function // Callback when sign-in needed
}
```

**Tab Details**:
1. **Review Queue**: Shows only reels with academicStatus = "PENDING"
   - Endpoint: `GET /api/reels/faculty/review-queue`
2. **All Reels**: Shows all student reels with filtering options
   - Endpoint: `GET /api/reels/faculty/filter`
3. **My Guidance**: Shows faculty-created guidance reels
   - Endpoint: `GET /api/reels/faculty/guidance-reels`

**API Endpoints Called**:
- `GET /api/reels/faculty/review-queue` - Get reels pending review
- `GET /api/reels/faculty/filter?department=...&subject=...&skill=...&year=...`
- `GET /api/reels/faculty/guidance-reels` - Get faculty's uploaded reels
- `POST /api/reels/{reelId}/academic-status?status={PENDING|APPROVED|FLAGGED}`
- `POST /api/reels/{reelId}/placement-ready?isPlacementReady={true|false}`
- `POST /api/reels/{reelId}/faculty-feedback` - Submit feedback
- `POST /api/reels/{reelId}/share?audience={CLASS|DEPARTMENT|PLACEMENT_CELL}`

**Feedback Submission**:
```javascript
{
  feedbackText: string,    // Constructive feedback message
  rating: number,          // 0-10 scale
  tags: [],               // Tag array (optional)
  featuredTag: string     // One of: NONE, GOOD_PROJECT, NEEDS_IMPROVEMENT, PLACEMENT_READY
}
```

#### 3. **InstagramStyleUploadModal.jsx**
- **Purpose**: Unified upload interface for both students and faculty
- **Location**: `frontend/src/components/InstagramStyleUploadModal.jsx`

**Key Features**:
- Video file upload with validation (MP4, MOV, AVI, WebM, max 500MB)
- Video preview with playback
- Title input with character counter (100 max)
- Description textarea with counter (500 max)
- Category selection (different for student/faculty)
- Hashtag management with add/remove
- Academic metadata fields:
  - Subject (dropdown)
  - Skill (dropdown)
  - Semester (dropdown)
  - Year (dropdown)
- Visibility settings (Private, Class, Department, Public)
- Real-time validation
- Error/Success notifications
- File size and format validation

**Props**:
```javascript
{
  isOpen: boolean,           // Modal visibility
  onClose: function,         // Close modal callback
  userId: string,           // Student/Faculty ID
  userType: string,         // "STUDENT" or "FACULTY"
  onSuccess: function       // Success callback (auto-closes)
}
```

**Student Categories**: Projects, Placements, Events & Clubs, Achievements, Learning Shorts

**Faculty Categories**: Interview Tips, Project Suggestions, Academic Explanations, Career Guidance, Best Practices

**Upload Endpoints**:
- Student: `POST /api/reels/upload`
- Faculty: `POST /api/reels/upload-guidance`

**FormData Fields**:
```javascript
{
  video: File,              // Video file
  title: string,
  description: string,
  category: string,
  hashtags: JSON.stringify([]),
  subject: string,
  skill: string,
  semester: string,
  year: string,
  visibility: string,       // PRIVATE, CLASS, DEPARTMENT, PUBLIC
  reelType: string         // STUDENT_CREATED, FACULTY_CREATED
}
```

### Database Schema

#### Reel Document (MongoDB)

```javascript
{
  _id: ObjectId,
  studentId: string,                    // Creator (student or faculty)
  studentName: string,
  avatar: string,                       // Profile image URL
  department: string,
  year: string,
  videoUrl: string,                     // Video file path/URL
  title: string,
  description: string,
  category: string,                     // Category label
  hashtags: [string],                   // Array of hashtags
  
  // Academic Fields
  subject: string,
  skill: string,
  semester: string,
  year: string,
  academicStatus: string,               // PENDING, APPROVED, FLAGGED
  academicScore: number,                // 0-100 (calculated from faculty ratings)
  reelType: string,                     // STUDENT_CREATED, FACULTY_CREATED
  placementReady: boolean,
  placementVisibility: string,          // PRIVATE, CLASS, DEPARTMENT, PUBLIC
  
  // Faculty Feedback
  facultyFeedbacks: [{
    id: string,
    facultyId: string,
    facultyName: string,
    feedbackText: string,
    rating: number,                     // 0-10
    tags: [string],
    createdAt: Date,
    featuredTag: string                // NONE, GOOD_PROJECT, NEEDS_IMPROVEMENT, etc.
  }],
  
  likedByFaculty: [string],             // Array of faculty IDs who liked
  sharedWith: [{
    audience: string,                   // CLASS, DEPARTMENT, PLACEMENT_CELL
    sharedAt: Date,
    sharedBy: string                    // Faculty ID
  }],
  
  // Engagement Metrics
  likes: number,
  comments: number,
  saves: number,
  views: number,
  
  // Comments
  commentList: [{
    id: string,
    studentId: string,
    studentName: string,
    avatar: string,
    text: string,
    isFromFaculty: boolean,
    facultyId: string,
    role: string,                       // STUDENT, FACULTY
    createdAt: Date
  }],
  
  // Engagement Tracking
  likedBy: [string],                    // Array of user IDs who liked
  savedBy: [string],                    // Array of user IDs who saved
  viewedBy: [{                          // Track views
    userId: string,
    viewedAt: Date
  }],
  
  visibility: string,                   // PRIVATE, CLASS, DEPARTMENT, PUBLIC
  createdAt: Date,
  updatedAt: Date
}
```

### Backend Enhancements

#### New REST Endpoints

**Student Endpoints**:
```
GET  /api/reels                                    - Get feed reels
GET  /api/reels/my-reels                          - Get student's own reels
GET  /api/reels/{reelId}                          - Get single reel details
POST /api/reels/upload                            - Upload new reel
POST /api/reels/{reelId}/like                     - Like reel
POST /api/reels/{reelId}/unlike                   - Unlike reel
POST /api/reels/{reelId}/save                     - Save reel
POST /api/reels/{reelId}/unsave                   - Unsave reel
POST /api/reels/{reelId}/comment                  - Add comment
```

**Faculty Endpoints**:
```
GET  /api/reels/faculty/review-queue              - Get reels pending review
GET  /api/reels/faculty/filter                    - Filter reels by criteria
GET  /api/reels/faculty/guidance-reels            - Get faculty's guidance reels
GET  /api/reels/faculty/my-reels                  - Get faculty's created reels
POST /api/reels/{reelId}/academic-status          - Set academic status
POST /api/reels/{reelId}/placement-ready          - Mark placement ready
POST /api/reels/{reelId}/faculty-feedback         - Submit feedback
POST /api/reels/{reelId}/faculty-like             - Faculty like (separate tracking)
POST /api/reels/{reelId}/share                    - Share with audience
POST /api/reels/upload-guidance                   - Upload guidance reel
```

#### Request/Response Examples

**Upload Reel (multipart/form-data)**:
```javascript
Request Headers:
{
  'X-Student-Id': 'student-123',
  'Content-Type': 'multipart/form-data'
}

FormData:
{
  video: <File>,
  title: "My Project Demo",
  description: "Demonstrating React hooks implementation",
  category: "Projects",
  hashtags: '["#react", "#webdev", "#project"]',
  subject: "Web Development",
  skill: "Problem Solving",
  semester: "Semester 5",
  year: "Third Year",
  visibility: "CLASS",
  reelType: "STUDENT_CREATED"
}

Response (201 Created):
{
  id: "reel-123",
  studentId: "student-123",
  title: "My Project Demo",
  videoUrl: "/uploads/reels/reel-123.mp4",
  createdAt: "2026-01-06T10:30:00Z"
}
```

**Submit Faculty Feedback**:
```javascript
Request:
POST /api/reels/reel-123/faculty-feedback
Headers: { 'X-Faculty-Id': 'faculty-456' }
Body: {
  feedbackText: "Great execution! Consider adding error handling.",
  rating: 8,
  tags: ["Excellent", "Good_Code"],
  featuredTag: "GOOD_PROJECT"
}

Response (200 OK):
{
  feedbackId: "feedback-789",
  reelId: "reel-123",
  rating: 8,
  academicScore: 80
}
```

**Filter Reels**:
```javascript
Request:
GET /api/reels/faculty/filter?department=CS&subject=Web%20Development&skill=Problem%20Solving&year=Third%20Year

Response (200 OK):
[
  {
    id: "reel-123",
    studentName: "John Doe",
    title: "Project Demo",
    category: "Projects",
    academicStatus: "PENDING",
    academicScore: 0,
    subject: "Web Development",
    skill: "Problem Solving",
    year: "Third Year",
    likes: 12,
    comments: 3,
    views: 45
  },
  // ... more reels
]
```

### WebSocket Events

#### Connection Establishment
```javascript
// Client
const ws = new WebSocket(
  `ws://localhost:8085/ws/reels?userId=${userId}&role=${role}`
);

// Role: STUDENT or FACULTY
```

#### Event Messages

**SUBSCRIBE_REEL** (Client → Server):
```javascript
{
  action: 'SUBSCRIBE_REEL',
  reelId: 'reel-123'
}
```

**REEL_UPDATE** (Server → Client):
```javascript
{
  type: 'REEL_UPDATE',
  reelId: 'reel-123',
  updateType: 'FEEDBACK_ADDED|STATUS_CHANGED|PLACEMENT_STATUS_CHANGED|NEW_COMMENT',
  data: {
    feedbackId: 'fb-123',
    rating: 8,
    academicScore: 80,
    facultyName: 'Dr. Smith'
  }
}
```

**NOTIFICATION** (Server → Client):
```javascript
{
  type: 'NOTIFICATION',
  notificationType: 'REEL_FEEDBACK|REEL_APPROVED|PLACEMENT_READY|FACULTY_COMMENT',
  title: 'Faculty Feedback Received',
  message: 'Dr. Smith gave feedback on your reel',
  reelId: 'reel-123',
  studentId: 'student-123'
}
```

**FACULTY_COMMENT** (Server → Client):
```javascript
{
  type: 'FACULTY_COMMENT',
  reelId: 'reel-123',
  commentId: 'comment-456',
  facultyName: 'Dr. Smith',
  commentText: 'Good work! Please improve error handling.',
  role: 'FACULTY'
}
```

## Integration Steps

### 1. Frontend Setup

**Install Required Dependencies**:
```bash
npm install lucide-react
```

**Import Components in App.jsx/App.js**:
```javascript
import InstagramStyleReelsFeed from './components/InstagramStyleReelsFeed';
import InstagramStyleFacultyReelsFeed from './components/InstagramStyleFacultyReelsFeed';
import InstagramStyleUploadModal from './components/InstagramStyleUploadModal';
```

**Add Routes**:
```javascript
// Student Portal Routes
<Route path="/student/reels" element={<InstagramStyleReelsFeed studentId={userId} onBack={() => navigate(-1)} />} />

// Faculty Portal Routes
<Route path="/faculty/reels" element={<InstagramStyleFacultyReelsFeed facultyId={facultyId} onBack={() => navigate(-1)} />} />
```

**Show Upload Modal**:
```javascript
const [uploadOpen, setUploadOpen] = useState(false);

<button onClick={() => setUploadOpen(true)}>+ Upload Reel</button>

<InstagramStyleUploadModal
  isOpen={uploadOpen}
  onClose={() => setUploadOpen(false)}
  userId={currentUserId}
  userType={userType}
  onSuccess={() => {
    // Refresh reels list
    window.location.reload(); // Or call API again
  }}
/>
```

### 2. Backend Implementation

**Required Spring Boot Endpoints** (implement in ReelController):

```java
// GET endpoints
@GetMapping("/faculty/review-queue")
@GetMapping("/faculty/filter")
@GetMapping("/faculty/guidance-reels")

// POST endpoints for uploads
@PostMapping("/upload")
@PostMapping("/upload-guidance")

// Faculty action endpoints
@PostMapping("/{reelId}/academic-status")
@PostMapping("/{reelId}/placement-ready")
@PostMapping("/{reelId}/faculty-feedback")
@PostMapping("/{reelId}/share")
```

**WebSocket Handler Registration**:
```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
  @Override
  public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    registry.addHandler(new ReelWebSocketHandler(), "/ws/reels")
      .setAllowedOrigins("*");
  }
}
```

### 3. Database Indexes

Create these MongoDB indexes for optimal query performance:

```javascript
// Reel collection indexes
db.reels.createIndex({ academicStatus: 1 })
db.reels.createIndex({ placementReady: 1 })
db.reels.createIndex({ createdAt: -1 })
db.reels.createIndex({ studentId: 1, createdAt: -1 })
db.reels.createIndex({ category: 1, subject: 1, skill: 1 })
db.reels.createIndex({ reelType: 1, createdAt: -1 })
db.reels.createIndex({ views.userId: 1 })
db.reels.createIndex({ sharedWith.audience: 1 })

// Notifications collection
db.notifications.createIndex({ studentId: 1, read: 1, createdAt: -1 })
```

### 4. Configuration

**Environment Variables** (`.env`):
```
VITE_API_BASE=http://localhost:8085
VITE_WS_URL=ws://localhost:8085
VITE_MAX_VIDEO_SIZE=524288000  # 500MB in bytes
```

## Usage Examples

### Student Portal Usage

```javascript
// 1. View reels in feed
<InstagramStyleReelsFeed 
  studentId="student-123"
  onBack={() => navigate('/dashboard')}
/>

// 2. Upload a reel
<InstagramStyleUploadModal
  isOpen={true}
  onClose={() => setOpen(false)}
  userId="student-123"
  userType="STUDENT"
  onSuccess={() => console.log('Reel uploaded!')}
/>

// 3. Interactions
// - Swipe up/down to navigate reels
// - Double-tap to like
// - Long-press for options (report, download)
// - Click side buttons for actions
```

### Faculty Portal Usage

```javascript
// 1. Review pending reels
<InstagramStyleFacultyReelsFeed
  facultyId="faculty-456"
  onBack={() => navigate('/faculty')}
/>

// 2. Provide feedback and verification
// - Click "Feedback" button
// - Enter rating (0-10)
// - Write constructive feedback
// - Submit (auto-calculates academic score)

// 3. Mark placement readiness
// - Click "Placement" button
// - Reel marked as PLACEMENT_READY
// - Visibility auto-set to PUBLIC

// 4. Share guidance reels
// - Tab: "My Guidance"
// - Upload guidance reels
// - Share with Class, Department, or Placement Cell
```

## Real-Time Sync Flow

### Scenario: Faculty provides feedback

```
1. Faculty submits feedback via UI
   ↓
2. POST /api/reels/{reelId}/faculty-feedback
   ↓
3. Backend:
   - Saves FacultyFeedback object
   - Calculates new academicScore
   - Updates reel document
   ↓
4. WebSocket broadcast to all subscribers of reel:
   {
     type: 'REEL_UPDATE',
     updateType: 'FEEDBACK_ADDED',
     data: { rating: 8, academicScore: 80 }
   }
   ↓
5. WebSocket notification to student:
   {
     type: 'NOTIFICATION',
     notificationType: 'REEL_FEEDBACK',
     message: 'Dr. Smith gave feedback'
   }
   ↓
6. Student sees:
   - Real-time notification popup
   - Reel auto-refreshes with new feedback
   - Academic score progress bar updates
   - Faculty feedback displays in UI
```

## Styling Reference

### Color Scheme
- **Primary**: `#2563EB` (Blue-600)
- **Background**: `#000000` (Black)
- **Card Background**: `#111827` (Gray-900)
- **Border**: `#374151` (Gray-700)
- **Text Primary**: White
- **Text Secondary**: `#D1D5DB` (Gray-300)
- **Success**: `#10B981` (Green-500)
- **Error**: `#EF4444` (Red-500)
- **Warning**: `#F59E0B` (Amber-500)

### Responsive Breakpoints
- Mobile: `< 640px` (full-screen reel view primary)
- Tablet: `640px - 1024px` (side action bar visible)
- Desktop: `> 1024px` (full interface visible)

## Performance Optimization

1. **Lazy Loading**: Load reels incrementally as user scrolls
2. **Video Caching**: Browser cache 9:16 video previews
3. **Database Pagination**: Use cursor-based pagination for large datasets
4. **WebSocket Optimization**: Subscribe only to visible reel
5. **Image Optimization**: Compress avatars to <50KB
6. **Bundle Splitting**: Separate upload modal into async chunk

## Security Considerations

1. **File Upload Validation**:
   - Whitelist video formats only
   - Validate file size server-side
   - Scan for malicious content
   - Generate unique filenames

2. **Access Control**:
   - Verify `X-Student-Id` / `X-Faculty-Id` headers
   - Check visibility settings before serving reels
   - Validate user permissions for faculty actions

3. **Content Moderation**:
   - Implement auto-scanning for inappropriate content
   - Flag reels for manual review if needed
   - Allow users to report content

4. **Rate Limiting**:
   - Limit uploads: 5 per day per student
   - Limit API calls: 100 per minute per user
   - Limit WebSocket messages: 10 per second per user

## Troubleshooting

**Issue**: WebSocket connection fails
- **Solution**: Check WebSocket URL matches backend configuration
- **Check**: Verify CORS is configured on backend
- **Test**: Use browser DevTools → Network → WS tab

**Issue**: Videos not playing
- **Solution**: Verify video format is supported (MP4, WebM, MOV)
- **Check**: Ensure file permissions on server
- **Test**: Try different video file

**Issue**: Faculty feedback not appearing
- **Solution**: Check that backend endpoint returns updated reel
- **Check**: Verify WebSocket message is received (DevTools Console)
- **Test**: Manually reload reel data via API

**Issue**: Real-time sync is slow
- **Solution**: Increase WebSocket message buffer
- **Check**: Database query performance with MongoDB profiler
- **Test**: Reduce subscription scope to single reel

## Migration from Old ReelsAndFeed

If migrating from previous version:

1. **Database Migration**: Map old reel structure to new academic fields
2. **User Data**: Preserve likes, comments, saves, views
3. **Faculty Feedback**: Convert any existing feedback to new format
4. **Testing**: Verify all old reels display correctly

---

**Last Updated**: January 6, 2026
**Version**: 2.0 (Instagram-Style Redesign)
**Status**: Production Ready
