# 🎓 Student & Faculty Portal - Reels & Feed Implementation Guide

## Overview

The Reels & Feed module is now fully enhanced with:
- Academic categorization and validation
- Real-time synchronization between student and faculty portals
- Faculty feedback and quality control
- Placement readiness tracking
- Smart notifications
- WebSocket-based real-time updates

---

## 📊 Database Schema Updates

### Reel Model Enhancements

The `Reel` collection now includes:

```javascript
{
  // Existing fields
  id, studentId, studentName, department, avatar, title, description,
  videoUrl, thumbnailUrl, createdAt, updatedAt, views, likes, comments, saves,
  verified, safe, hashtags, commentList, likedByStudents, savedByStudents,

  // NEW: Academic Fields
  year: String,
  subject: String, // Math, DSA, Web Dev, AI/ML, etc.
  skill: String, // DSA, Web, AI, Core Subject, etc.
  semester: String, // 1st, 2nd, 3rd, 4th, etc.
  clubOrEvent: String, // Optional

  // NEW: Academic Status & Validation
  academicStatus: String, // PENDING, APPROVED, FLAGGED
  academicScore: Number, // 0-100, calculated from faculty ratings
  reelType: String, // STUDENT_CREATED, FACULTY_CREATED
  
  // NEW: Placement Integration
  placementVisibility: String, // PRIVATE, PEERS_ONLY, FACULTY_ONLY, PUBLIC
  placementReady: Boolean, // True if faculty marks it as placement-ready
  
  // NEW: Faculty Feedback
  facultyFeedbacks: [
    {
      id: String,
      facultyId: String,
      facultyName: String,
      feedbackText: String,
      rating: Number, // 0-10 scale
      tags: [String], // "Excellent", "Good", "Needs Improvement"
      createdAt: Instant
    }
  ],
  
  // NEW: Faculty Actions
  likedByFaculty: [String], // Array of faculty IDs who liked
  sharedWith: [String], // ["CLASS", "DEPARTMENT", "PLACEMENT_CELL"]
  featuredTag: String // NONE, GOOD_PROJECT, NEEDS_IMPROVEMENT, PLACEMENT_READY, ACADEMIC_HIGHLIGHT,

  // NEW: Enhanced Comments (Support Faculty Badges)
  commentList: [
    {
      id, studentId, studentName, avatar, text, createdAt, likes,
      isFromFaculty: Boolean,
      facultyId: String,
      role: String // "STUDENT" or "FACULTY"
    }
  ]
}
```

### New Collections

#### Notification Collection
```javascript
{
  id, studentId, type, title, message,
  relatedEntityId, relatedEntityType,
  createdAt, read, actionUrl
}
```

---

## 🔌 API Endpoints

### Student Endpoints

#### Create Reel with Academic Tags
```http
POST /api/reels/create
Header: X-Student-Id: {studentId}
Body: {
  title: String,
  description: String,
  videoUrl: String,
  thumbnailUrl: String,
  category: String, // Projects, Placements, Events & Clubs, Achievements, Learning Shorts
  hashtags: [String],
  subject: String, // NEW
  skill: String, // NEW
  semester: String, // NEW
  clubOrEvent: String, // NEW - Optional
  placementVisibility: String // NEW - PRIVATE, PEERS_ONLY, FACULTY_ONLY, PUBLIC
}
```

#### Get All Reels (Student Feed)
```http
GET /api/reels?category={category}&sortBy={sortBy}
Header: X-Student-Id: {studentId}
Query: 
  - category (optional): All, Projects, Placements, Events & Clubs, Achievements, Learning Shorts
  - sortBy (optional): recent (default), likes, views
Response: List<ReelFeedResponse>
```

#### Get My Reels
```http
GET /api/reels/my-reels
Header: X-Student-Id: {studentId}
Response: List<ReelResponse>
```

#### Like/Unlike Reel
```http
POST /api/reels/{reelId}/like
POST /api/reels/{reelId}/unlike
Header: X-Student-Id: {studentId}
Response: ReelResponse
```

#### Save/Unsave Reel
```http
POST /api/reels/{reelId}/save
POST /api/reels/{reelId}/unsave
Header: X-Student-Id: {studentId}
Response: ReelResponse
```

#### Add Comment
```http
POST /api/reels/{reelId}/comment
Header: X-Student-Id: {studentId}
Body: {
  text: String
}
Response: ReelResponse
```

---

### Faculty Endpoints

#### Add Feedback to Reel
```http
POST /api/reels/{reelId}/faculty-feedback
Header: X-Faculty-Id: {facultyId}
Body: {
  feedbackText: String,
  rating: Number, // 0-10
  tags: [String], // "Excellent", "Good", "Needs Improvement", "Incomplete"
  featuredTag: String // NONE, GOOD_PROJECT, NEEDS_IMPROVEMENT, PLACEMENT_READY, ACADEMIC_HIGHLIGHT
}
Response: ReelFeedResponse
Academic Score is auto-calculated as average of all faculty ratings × 10
```

#### Set Academic Status
```http
POST /api/reels/{reelId}/academic-status
Header: X-Faculty-Id: {facultyId}
Query: status={PENDING|APPROVED|FLAGGED}
Response: ReelFeedResponse
```

#### Mark Reel as Placement Ready
```http
POST /api/reels/{reelId}/placement-ready
Header: X-Faculty-Id: {facultyId}
Query: isPlacementReady={true|false}
Response: ReelFeedResponse
Note: Sets placementVisibility to PUBLIC when true
```

#### Faculty Like Reel
```http
POST /api/reels/{reelId}/faculty-like
Header: X-Faculty-Id: {facultyId}
Response: ReelFeedResponse
```

#### Share Reel
```http
POST /api/reels/{reelId}/share
Header: X-Faculty-Id: {facultyId}
Query: audience={CLASS|DEPARTMENT|PLACEMENT_CELL}
Response: ReelFeedResponse
Note: Can share with multiple audiences
```

#### Get Reels Requiring Review
```http
GET /api/reels/faculty/review-queue
Header: X-Faculty-Id: {facultyId}
Response: List<ReelFeedResponse>
Note: Returns only reels with academicStatus = PENDING
```

#### Filter Reels by Academic Criteria
```http
GET /api/reels/faculty/filter
Header: X-Faculty-Id: {facultyId}
Query: 
  - subject (optional)
  - skill (optional)
  - year (optional)
  - semester (optional)
Response: List<ReelFeedResponse>
```

#### Get Faculty's Own Reels
```http
GET /api/reels/faculty/my-reels
Header: X-Faculty-Id: {facultyId}
Response: List<ReelResponse>
Note: Returns reels where reelType = FACULTY_CREATED
```

---

## 🔄 WebSocket Events

### Connection
```javascript
// Student Connection
ws://localhost:8085/ws/reels?userId={studentId}&role=STUDENT

// Faculty Connection
ws://localhost:8085/ws/reels?userId={facultyId}&role=FACULTY
```

### Messages from Client

#### Subscribe to Reel Updates
```javascript
{
  action: "SUBSCRIBE_REEL",
  reelId: String
}
```

#### Unsubscribe from Reel
```javascript
{
  action: "UNSUBSCRIBE_REEL",
  reelId: String
}
```

### Messages from Server

#### Reel Update
```javascript
{
  type: "REEL_UPDATE",
  updateType: "FEEDBACK_ADDED" | "STATUS_CHANGED" | "PLACEMENT_STATUS_CHANGED" | "NEW_COMMENT",
  reelId: String,
  data: {...reelData}
}
```

#### Notification
```javascript
{
  type: "NOTIFICATION",
  notificationType: "REEL_FEEDBACK_ADDED" | "REEL_APPROVED" | "PLACEMENT_READY" | "FACULTY_COMMENT",
  title: String,
  message: String,
  timestamp: Long
}
```

---

## 🎨 Frontend Components

### Student Portal Components

#### StudentReelsFeed.jsx
- Main feed display with real-time updates
- Advanced filtering by subject, skill, semester
- Search functionality
- Category browsing
- Tabs: Feed, My Reels, Saved
- Real-time notification integration

#### ReelCard.jsx (Inside StudentReelsFeed)
- Display individual reel with academic tags
- Show faculty feedback & scores
- Like/Save buttons
- Comment functionality
- Placement readiness indicators
- Faculty verification badges

### Faculty Portal Components

#### FacultyReelsFeed.jsx
- Review queue with pending reels
- Analytics dashboard
- Advanced filtering
- Bulk actions on reels
- Detailed feedback interface

#### FacultyReelCard.jsx (Inside FacultyReelsFeed)
- Display reel with academic metrics
- Quick actions: Feedback, Like, Share
- Context menu for administrative actions
- Academic score visualization
- Student information

#### FeedbackModal.jsx
- Textarea for feedback
- Rating slider (0-10)
- Tag selection
- Featured tag selection
- Submit/Cancel actions

#### AnalyticsDashboard.jsx
- Key metrics: Total reels, avg score, placement-ready count
- Skill breakdown chart
- Category breakdown chart
- Top performing students leaderboard

---

## 📱 Real-Time Sync Flow

### When Faculty Adds Feedback:
1. Faculty submits feedback via FeedbackModal
2. API: `POST /api/reels/{reelId}/faculty-feedback`
3. Backend updates Reel document with feedback
4. WebSocket broadcasts `REEL_UPDATE` event
5. Student's WebSocket listener receives update
6. `StudentReelsFeed` reloads reels automatically
7. Student sees updated academic score & faculty comment
8. Notification sent to student

### When Faculty Marks Placement Ready:
1. Faculty clicks "Mark Placement Ready"
2. API: `POST /api/reels/{reelId}/placement-ready?isPlacementReady=true`
3. Backend sets `placementReady=true`, `placementVisibility=PUBLIC`
4. Updates `academicStatus` if not approved
5. WebSocket broadcasts update
6. Student sees green badge "Placement Ready"
7. Reel appears in placement-ready filters

### When Faculty Shares Reel:
1. Faculty selects audience (Class/Department/Placement Cell)
2. API: `POST /api/reels/{reelId}/share?audience=CLASS`
3. Backend adds audience to `sharedWith` array
4. WebSocket notifies all relevant users
5. Reel appears in shared feed for audience
6. Notification: "Your reel was shared with class!"

---

## 🔐 RBAC (Role-Based Access Control)

### Student Permissions
- ✅ Create reels with academic tags
- ✅ Like/Unlike any reel
- ✅ Comment on reels
- ✅ Save reels
- ✅ Delete own reels
- ✅ View feedback from faculty
- ✅ See academic scores
- ✅ View placement-ready reels
- ❌ Cannot approve/reject reels
- ❌ Cannot see other students' private reels

### Faculty Permissions
- ✅ View all reels in their department
- ✅ Add official feedback & ratings
- ✅ Mark reels as academic status (PENDING/APPROVED/FLAGGED)
- ✅ Mark reels as placement-ready
- ✅ Share reels with class/department/placement cell
- ✅ Like reels (faculty-specific)
- ✅ Comment on reels (with faculty badge)
- ✅ Create faculty-instructional reels
- ✅ View analytics dashboard
- ✅ Filter by subject, skill, semester, year
- ❌ Cannot delete student reels directly
- ❌ Cannot modify student reel metadata

---

## 🔧 Integration Checklist

### Backend
- [x] Enhanced Reel model with academic fields
- [x] FacultyFeedback inner class
- [x] Enhanced Comment class with faculty support
- [x] ReelService methods for faculty operations
- [x] ReelController endpoints for faculty
- [x] WebSocket handler for real-time sync
- [x] Notification model
- [ ] Permission validation middleware (use existing JWT auth)
- [ ] Email notifications for important events
- [ ] Batch operations for bulk feedback

### Frontend - Student Portal
- [x] StudentReelsFeed.jsx component
- [x] Advanced filtering UI
- [x] Real-time WebSocket listener
- [x] Faculty feedback display
- [x] Academic score visualization
- [ ] Notification toast system
- [ ] Share functionality
- [ ] Comment thread UI
- [ ] Upload reel modal enhancements

### Frontend - Faculty Portal
- [x] FacultyReelsFeed.jsx component
- [x] Feedback modal
- [x] Analytics dashboard
- [x] Filtering UI
- [x] Share context menu
- [ ] Bulk feedback operations
- [ ] Export analytics data
- [ ] Notification settings
- [ ] Report generation

---

## 🚀 Deployment Notes

1. **WebSocket Configuration**
   - Ensure WebSocket is enabled in Spring Boot config
   - Update CORS configuration if deploying to different domain
   - Test WebSocket connection with both student and faculty roles

2. **Database Indexing**
   - Create index on `academicStatus` for faster queries
   - Create index on `placementReady` for placement queries
   - Create compound index on `(subject, skill, semester)` for filtering

3. **Environment Variables**
   - Update API_BASE in frontend to match backend URL
   - Ensure WebSocket URL is accessible from client

4. **Real-Time Testing**
   - Open two browser windows (student + faculty)
   - Submit feedback as faculty
   - Verify real-time update in student portal
   - Check WebSocket messages in browser dev tools

---

## 📊 Sample Data Structure

### Sample Student Reel
```json
{
  "id": "reel-001",
  "studentId": "student-123",
  "studentName": "Rajesh Kumar",
  "department": "CSE",
  "year": "3rd",
  "avatar": "https://...",
  "title": "Building a Real-Time Chat App with Socket.io",
  "description": "Implemented a full-stack chat application...",
  "category": "Projects",
  "subject": "Web Development",
  "skill": "Web",
  "semester": "6th",
  "clubOrEvent": "Web Dev Club",
  "videoUrl": "https://...",
  "academicStatus": "PENDING",
  "academicScore": 0,
  "placementVisibility": "PRIVATE",
  "placementReady": false,
  "reelType": "STUDENT_CREATED",
  "createdAt": "2024-01-06T10:30:00Z",
  "views": 45,
  "likes": 12,
  "comments": 3,
  "saves": 5,
  "facultyFeedbacks": [],
  "likedByFaculty": [],
  "sharedWith": [],
  "featuredTag": "NONE"
}
```

### Sample Faculty Feedback
```json
{
  "id": "feedback-001",
  "facultyId": "faculty-456",
  "facultyName": "Dr. Priya Singh",
  "feedbackText": "Great project! The Socket.io implementation is clean. Consider adding error handling...",
  "rating": 8.5,
  "tags": ["Good", "Clean Code"],
  "createdAt": "2024-01-06T11:00:00Z"
}
```

---

## 📞 Support & Troubleshooting

### WebSocket Not Connecting
- Check if backend is running on port 8085
- Verify CORS configuration includes WebSocket endpoints
- Check browser console for connection errors

### Real-Time Updates Not Working
- Ensure WebSocket connection is established
- Check if faculty ID header is being sent correctly
- Verify database write was successful

### Academic Score Not Updating
- Score is calculated as: `average(faculty_ratings) * 10`
- Requires at least one faculty feedback
- Check if scores are being persisted in database

---

## 🎯 Next Steps

1. **Integration Testing**
   - Test complete feedback flow from faculty to student
   - Verify WebSocket messages in multiple connections
   - Test filtering and search functionality

2. **Feature Enhancements**
   - Add email notifications for important events
   - Implement reel views analytics
   - Add comment threading/replies
   - Create custom notification preferences

3. **Performance Optimization**
   - Implement pagination for large reel lists
   - Add caching for frequently accessed reels
   - Optimize WebSocket message size

4. **Security Hardening**
   - Validate all user inputs
   - Implement rate limiting on API endpoints
   - Add audit logging for faculty actions
   - Encrypt sensitive feedback data

---

Last Updated: January 6, 2026
Version: 1.0.0
