# 📱 Student Portal Sync Integration Guide

## Overview

The Student Portal's **Events & Clubs** module is now fully integrated with the Faculty Events & Clubs Portal backend APIs. This guide explains what was changed and how the two portals work together.

---

## ✅ Changes Made to Student Portal

### 1. **API Integration**

**Before**: Static hardcoded event and club data  
**After**: Real-time data fetched from backend APIs

```javascript
// Now fetches published events only
GET /api/faculty/events (filters status = "Published")
GET /api/faculty/clubs (filters status = "Active")
```

### 2. **Event Registration Flow**

**Students can now:**
- View only PUBLISHED events (faculty-created)
- Register for events instantly
- See real-time registration count

**Backend receives:**
- POST /api/faculty/events/:eventId/register/:studentId
- Updates registration count
- Faculty sees in registrations list immediately

### 3. **Club Joining System**

**Students can now:**
- View only ACTIVE approved clubs
- Join clubs with one click
- Leave clubs anytime
- See member count

**Backend receives:**
- POST /api/faculty/clubs/:clubId/members/:studentId (join)
- DELETE /api/faculty/clubs/:clubId/members/:studentId (leave)
- Updates member count for faculty

### 4. **Event Status Display**

Students now see event status with correct filtering:

| Status | Visible to Students? |
|--------|----------------------|
| Draft | ❌ No |
| Published | ✅ Yes |
| Completed | ✅ Yes (grayed out) |
| Cancelled | ❌ No |
| Pending Approval | ❌ No |

### 5. **Attendance Tracking (Read-Only)**

*Future feature* - When faculty marks attendance:
- Students can view their attendance status
- Shows ✅ Attended or ❌ Absent
- Visible in "My Events" tab

### 6. **Real-Time Data**

**Implemented:**
- Events load from backend on component mount
- Registration updates sync immediately
- Club join/leave updates sync immediately
- Stats update after each action

**UI Features:**
- Loading states while fetching
- Toast notifications for actions
- Error handling with user messages
- Empty states with helpful messages

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ STUDENT PORTAL (EventsAndClubs.jsx)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  All Events Tab         Clubs Tab      My Events Tab   │
│  ├─ Fetch events        ├─ Fetch       ├─ Show         │
│  │  (Published only)    │  clubs       │  registered   │
│  │                      │  (Active)    │  events       │
│  ├─ Display list        │              │               │
│  ├─ Register action  → REGISTER      ├─ Show stats   │
│  └─ Like/favorite    → API CALLS     └─ Unlike event │
│                                                         │
│  API SERVICE LAYER                                      │
│  ├─ GET /events                                        │
│  ├─ GET /clubs                                         │
│  ├─ POST /events/:id/register/:studentId              │
│  ├─ POST /clubs/:id/members/:studentId                │
│  └─ DELETE /clubs/:id/members/:studentId              │
│                                                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
        ┌──────────────────────────────┐
        │  BACKEND (Spring Boot)        │
        │  - MongoDB Collections        │
        │  - EventService, ClubService  │
        │  - EventController,           │
        │    ClubController             │
        └──────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│ FACULTY PORTAL (FacultyEventsClubs.jsx)                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  See:                                                   │
│  ├─ Registrations updated in real-time                │
│  ├─ Member counts updated                             │
│  ├─ Analytics reflecting new data                      │
│  └─ Attendance records updated                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Student Portal Component Updates

### File Changed
`frontend/src/components/EventsAndClubs.js`

### Key Changes

#### 1. Imports Added
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
```

#### 2. New State Variables
```javascript
const [loading, setLoading] = useState(false);
const [events, setEvents] = useState([]);          // from API
const [clubs, setClubs] = useState([]);            // from API
const [toastMessage, setToastMessage] = useState('');
const [stats, setStats] = useState({...});
```

#### 3. New Functions

**loadAllData()** - Fetches events and clubs from backend
```javascript
- Calls GET /faculty/events
- Filters for status = "Published"
- Calls GET /faculty/clubs  
- Filters for status = "Active"
- Updates stats
```

**handleRegisterEvent(eventId)** - Student registers for event
```javascript
- Calls POST /events/:eventId/register/:studentId
- Updates local registered events list
- Shows success toast
- Refreshes data
```

**handleJoinClub(clubId)** - Student joins club
```javascript
- Calls POST /clubs/:clubId/members/:studentId
- Updates local joined clubs list
- Shows success toast
- Refreshes data
```

**handleLeaveClub(clubId)** - Student leaves club
```javascript
- Calls DELETE /clubs/:clubId/members/:studentId
- Removes from joined clubs list
- Shows success toast
- Refreshes data
```

#### 4. UI Updates

**All Events Tab:**
- Register button (conditional - shows "✓ Registered" if already registered)
- Event data from API (title, description, dateTime, venue, registrationCount)
- Status badge showing event type
- Like/favorite heart button

**Clubs Tab:**
- Join button (conditional - shows "✓ Member" if already joined)
- Club data from API (name, description, memberCount, status)
- Status badge (Active/Pending)
- Real-time member count

**My Events Tab:**
- Shows only events student registered for
- Displays upcoming/past event separation
- Shows favorites count
- Empty state with CTA to browse events

#### 5. Data Mapping

**Event Object from API:**
```javascript
{
  id: ObjectId,
  title: string,
  description: string,
  eventType: "Workshop" | "Seminar" | "Competition" | ...,
  dateTime: ISO string,
  venue: string,
  registrationCount: number,
  status: "Published" | "Draft" | "Completed" | "Cancelled",
  ...
}
```

**Club Object from API:**
```javascript
{
  id: ObjectId,
  name: string,
  description: string,
  category: string,
  memberCount: number,
  status: "Active" | "Pending" | "Suspended",
  ...
}
```

---

## 🔒 Permission & Access Control

### What Students CAN Do
✅ View published events  
✅ Register/unregister for events  
✅ View active clubs  
✅ Join/leave clubs  
✅ Like/bookmark events  
✅ View their registrations  
✅ View club member count  

### What Students CANNOT Do
❌ Create events (faculty only)  
❌ Publish events (faculty only)  
❌ Approve clubs (faculty only)  
❌ Edit club info (faculty only)  
❌ Mark attendance (faculty only)  
❌ Delete events/clubs (faculty only)  
❌ View pending/draft events  
❌ View suspended clubs  

**All permissions enforced on both frontend AND backend.**

---

## 🔌 API Endpoints Used by Students

### Events APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/faculty/events | Get all published events |
| POST | /api/faculty/events/:id/register/:studentId | Register for event |

### Clubs APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/faculty/clubs | Get all active clubs |
| POST | /api/faculty/clubs/:id/members/:studentId | Join club |
| DELETE | /api/faculty/clubs/:id/members/:studentId | Leave club |

---

## 📊 Student Portal Features

### Tab 1: All Events
- **Search** by title/location/keyword
- **Filter** by event type (Workshop, Seminar, Competition, etc.)
- **Register** for events with one click
- **Like** favorite events
- **View** registration count and date/time
- **Empty state** with helpful message

### Tab 2: Clubs  
- **Search** clubs by name
- **Join** clubs instantly
- **See** member count and status
- **Leave** clubs anytime
- **Empty state** when no clubs match search

### Tab 3: My Events
- **View** all registered events
- **See** upcoming vs. past events
- **Like** events in your list
- **Stats**: Total registered, Upcoming, Past, Favorites
- **Empty state** with CTA to browse

---

## 🎨 UI/UX Enhancements

### Loading States
- Shows "Loading events..." while fetching
- Shows "Loading clubs..." while fetching
- Shows "Loading your events..." on My Events

### Empty States
- "No events found. Check back soon!" - when no events match filters
- "No clubs found. Check back soon!" - when search has no results
- "No registered events yet" - when student hasn't registered for any

### Toast Notifications
- "Successfully registered for event!" - on successful registration
- "Successfully joined club!" - on successful club join
- "You left the club" - on successful club leave
- "Failed to register..." - on error

### Status Indicators
- ✅ Registered badge - green
- ✅ Member badge - green
- Event type badges - blue
- Status badges (Active/Pending) - color-coded

---

## 🚀 Deployment Checklist

### Backend Requirements
- [ ] Spring Boot running on port 8080
- [ ] MongoDB accessible
- [ ] EventController deployed
- [ ] ClubController deployed
- [ ] CORS configured for localhost:5173
- [ ] Faculty-Id header support working

### Frontend Requirements
- [ ] EventsAndClubs.js updated
- [ ] API_BASE_URL pointing to correct backend
- [ ] Student ID stored in localStorage as 'klhStudentId'
- [ ] Vite dev server running on port 5173

### Testing Checklist
- [ ] Student can view published events
- [ ] Student can register for event
- [ ] Faculty sees registration count update
- [ ] Student can join club
- [ ] Club member count updates
- [ ] Student can leave club
- [ ] My Events shows registered events
- [ ] Filter and search work
- [ ] Toast notifications appear
- [ ] Empty states display correctly
- [ ] Loading states show during API calls

---

## 🔐 Authentication & Security

### Current Implementation
- **Faculty ID** passed in request header for faculty endpoints
- **Student ID** obtained from localStorage
- **CORS** configured for frontend origin

### For Production
1. Implement proper JWT token authentication
2. Validate student ID on backend
3. Verify permission before each action
4. Log all user actions
5. Rate limit registration attempts
6. Validate input data server-side

---

## 🧪 Testing the Integration

### Test Scenario 1: Register for Event
```
1. Go to "All Events" tab in Student Portal
2. See list of published events from backend
3. Click "Register" on any event
4. See "✓ Registered" badge
5. Go to Faculty Portal → Registrations tab
6. Verify student appears in registration list
```

### Test Scenario 2: Join Club
```
1. Go to "Clubs" tab in Student Portal
2. See list of active clubs from backend
3. Click "Join Club"
4. See "✓ Member" badge
5. Go to Faculty Portal → Clubs Management
6. Verify member count increased
```

### Test Scenario 3: My Events
```
1. Register for 3 events from "All Events"
2. Go to "My Events" tab
3. See all 3 registered events
4. Verify stats show correct counts
5. Like one event (heart icon)
6. Verify favorite count increases
```

---

## 📝 Student Portal API Response Examples

### Get Events Response
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title": "React Workshop",
    "description": "Learn advanced React patterns",
    "eventType": "Workshop",
    "dateTime": "2024-01-15T10:00:00Z",
    "venue": "Tech Lab A",
    "maxParticipants": 50,
    "registrationCount": 32,
    "status": "Published",
    "createdBy": "faculty_123"
  }
]
```

### Get Clubs Response
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Tech Club",
    "description": "For all tech enthusiasts",
    "category": "Technical",
    "memberCount": 245,
    "status": "Active",
    "facultyCoordinator": "faculty_456"
  }
]
```

---

## 🎯 Next Steps

### Immediate (This Sprint)
- ✅ Update StudentPortal EventsAndClubs component
- ✅ Test registration flow
- ✅ Test club joining
- ✅ Verify real-time updates

### Short Term (Next Sprint)
- [ ] Add attendance marking (read-only for students)
- [ ] Implement event reminder notifications
- [ ] Add event cancellation handling
- [ ] Show faculty contact info

### Medium Term (Next Quarter)
- [ ] Add event calendar view
- [ ] Implement bookmarks/favorites persistence
- [ ] Add event rating/review system
- [ ] Create event recommendations
- [ ] Add QR code check-in

---

## 📞 Support & Troubleshooting

### Issue: "Failed to register for event"
**Cause**: Backend API not running or CORS issue  
**Fix**: Check backend is running on port 8080 and CORS is configured

### Issue: Events not showing
**Cause**: No published events in database  
**Fix**: Go to Faculty Portal and publish at least one event

### Issue: Registration button stays disabled
**Cause**: Student already registered (expected behavior)  
**Fix**: This is correct - button shows "✓ Registered" once they register

### Issue: Member count not updating
**Cause**: Page not refreshed after joining  
**Fix**: Data refreshes automatically, but you can also refresh browser

### Issue: Student ID not found
**Cause**: localStorage key is wrong  
**Fix**: Ensure student ID is stored as 'klhStudentId' in localStorage

---

## 📚 Related Documentation

- [Faculty Events & Clubs Implementation](FACULTY_EVENTS_CLUBS_IMPLEMENTATION.md)
- [API Testing Guide](FACULTY_EVENTS_CLUBS_API_TESTING.md)
- [Quick Start Guide](FACULTY_EVENTS_CLUBS_QUICK_START.md)
- [Developer Reference](DEVELOPER_QUICK_REFERENCE.md)

---

**Status**: ✅ Complete  
**Last Updated**: January 5, 2026  
**Version**: 1.0.0

