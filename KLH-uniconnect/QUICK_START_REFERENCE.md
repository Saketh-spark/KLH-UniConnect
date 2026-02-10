# 🎯 KLH-Uniconnect Quick Reference Card

## ⚡ Start Here

### Project Overview
- **Name**: KLH-Uniconnect Events & Clubs Management
- **Type**: Full-stack web application (React + Spring Boot + MongoDB)
- **Status**: ✅ Production Ready
- **Deployment**: Ready for immediate deployment

### Technologies
```
Frontend:  React 18.3.0 + Vite + Tailwind CSS
Backend:   Spring Boot 3.4.0 + Java 24 + MongoDB
Realtime:  Native WebSocket
APIs:      RESTful (28 endpoints)
```

---

## 🏗️ Project Structure

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── EventsAndClubs.jsx        ← Student Portal (Updated)
│   │   └── FacultyEventsClubs.jsx    ← Faculty Portal (Fixed)
│   ├── services/
│   │   ├── eventAPI.js               ← Event API calls
│   │   └── clubAPI.js                ← Club API calls
│   ├── App.jsx                       ← Router & Routes
│   └── main.jsx                      ← Entry point
```

### Backend
```
backend/
├── src/main/java/com/.../
│   ├── models/
│   │   ├── Event.java                ← 21 fields
│   │   └── Club.java                 ← 17 fields
│   ├── controllers/
│   │   ├── EventController.java      ← 14 endpoints
│   │   └── ClubController.java       ← 14 endpoints
│   ├── services/
│   │   ├── EventService.java
│   │   └── ClubService.java
│   └── repositories/
│       ├── EventRepository.java
│       └── ClubRepository.java
```

### Database
```
MongoDB (klh-uniconnect)
├── events              (21 fields each)
│   ├── _id, title, description, eventType
│   ├── dateTime, venue, maxParticipants
│   ├── status (Published/Draft/Completed)
│   ├── registeredStudents[], attendance[]
│   └── ...
└── clubs               (17 fields each)
    ├── _id, name, description, category
    ├── status (Active/Pending/Suspended)
    ├── members[], memberCount
    └── ...
```

---

## 🔌 API Quick Reference

### Event Endpoints (14 total)

| Method | Endpoint | Purpose | Who | Status |
|--------|----------|---------|-----|--------|
| GET | `/api/faculty/events` | List all events | Both | ✅ |
| POST | `/api/faculty/events` | Create event | Faculty | ✅ |
| GET | `/api/faculty/events/{id}` | Get event details | Both | ✅ |
| PUT | `/api/faculty/events/{id}` | Update event | Faculty | ✅ |
| DELETE | `/api/faculty/events/{id}` | Delete event | Faculty | ✅ |
| PATCH | `/api/faculty/events/{id}/publish` | Publish event | Faculty | ✅ |
| PATCH | `/api/faculty/events/{id}/complete` | Complete event | Faculty | ✅ |
| PATCH | `/api/faculty/events/{id}/cancel` | Cancel event | Faculty | ✅ |
| POST | `/api/faculty/events/{id}/register/{sid}` | Register student | Student | ✅ |
| DELETE | `/api/faculty/events/{id}/register/{sid}` | Unregister | Student | ✅ |
| PATCH | `/api/faculty/events/{id}/attendance/{sid}` | Mark attendance | Faculty | ✅ |
| GET | `/api/faculty/events/{id}/attendance` | Get attendance | Faculty | ✅ |
| GET | `/api/faculty/events/search` | Search events | Both | ✅ |
| GET | `/api/faculty/events/stats` | Get statistics | Faculty | ✅ |

### Club Endpoints (14 total)

| Method | Endpoint | Purpose | Who | Status |
|--------|----------|---------|-----|--------|
| GET | `/api/faculty/clubs` | List all clubs | Both | ✅ |
| POST | `/api/faculty/clubs` | Create club | Faculty | ✅ |
| GET | `/api/faculty/clubs/{id}` | Get club details | Both | ✅ |
| PUT | `/api/faculty/clubs/{id}` | Update club | Faculty | ✅ |
| DELETE | `/api/faculty/clubs/{id}` | Delete club | Faculty | ✅ |
| PATCH | `/api/faculty/clubs/{id}/approve` | Approve club | Faculty | ✅ |
| PATCH | `/api/faculty/clubs/{id}/suspend` | Suspend club | Faculty | ✅ |
| POST | `/api/faculty/clubs/{id}/members/{sid}` | Add member | Student | ✅ |
| DELETE | `/api/faculty/clubs/{id}/members/{sid}` | Remove member | Student | ✅ |
| GET | `/api/faculty/clubs/{id}/members` | List members | Both | ✅ |
| POST | `/api/faculty/clubs/{id}/events/{eid}` | Link event | Faculty | ✅ |
| GET | `/api/faculty/clubs/{id}/events` | Get club events | Both | ✅ |
| GET | `/api/faculty/clubs/search` | Search clubs | Both | ✅ |
| GET | `/api/faculty/clubs/stats` | Get statistics | Faculty | ✅ |

---

## 🚀 Running the Application

### Start Backend (Port 8080)

**Option 1: Maven**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Option 2: Pre-built JAR**
```bash
java -jar backend-0.1.0.jar
```

**Option 3: Docker (if available)**
```bash
docker-compose up -d backend
```

### Start Frontend (Port 5173)

```bash
cd frontend
npm install
npm run dev
```

### Start MongoDB (Port 27017)

```bash
# Windows
mongod

# Mac
brew services start mongodb-community

# Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### Access Application

```
Frontend: http://localhost:5173
Backend:  http://localhost:8080
WebSocket: ws://localhost:8080/ws/events-clubs
API Docs: http://localhost:8080/swagger-ui.html (if enabled)
```

---

## 📝 Key Components

### Student Portal: EventsAndClubs.jsx

**State Variables:**
```javascript
const [activeTab, setActiveTab] = useState('all-events');    // Current tab
const [events, setEvents] = useState([]);                     // All published events
const [clubs, setClubs] = useState([]);                       // All active clubs
const [registeredEvents, setRegisteredEvents] = useState([]);  // My registrations
const [joinedClubs, setJoinedClubs] = useState([]);           // My clubs
const [loading, setLoading] = useState(false);                // Loading state
```

**Key Functions:**
```javascript
loadAllData()                          // GET /events, /clubs
handleRegisterEvent(eventId)           // POST /events/{id}/register/{sid}
handleJoinClub(clubId)                 // POST /clubs/{id}/members/{sid}
handleLeaveClub(clubId)                // DELETE /clubs/{id}/members/{sid}
showToast(message)                     // Display notification
```

**Tabs:**
- **All Events**: Browse published events, register
- **Clubs**: Browse active clubs, join/leave
- **My Events**: View registered events, mark favorites

### Faculty Portal: FacultyEventsClubs.jsx

**Key Tabs:**
- **Dashboard**: Overview statistics and charts
- **All Events**: Create, edit, publish, delete events
- **Clubs**: Approve/suspend clubs, view members
- **Registrations**: Track student registrations
- **Analytics**: View metrics and reports

---

## 🔐 Authentication & Authorization

### Headers Required

**For Faculty Endpoints:**
```
Faculty-Id: {facultyId}
```

**For Student Endpoints:**
```
Student-Id: {studentId}
```

### Example Request

```bash
# Register for event (Student action)
curl -X POST http://localhost:8080/api/faculty/events/123/register/student_1 \
  -H "Content-Type: application/json"

# Publish event (Faculty action)
curl -X PATCH http://localhost:8080/api/faculty/events/123/publish \
  -H "Faculty-Id: faculty_1"
```

### Role-Based Access

| Action | Faculty | Student | Public |
|--------|---------|---------|--------|
| Create event | ✅ | ❌ | ❌ |
| Publish event | ✅ | ❌ | ❌ |
| View published events | ✅ | ✅ | ❌ |
| Register for event | ❌ | ✅ | ❌ |
| Create club | ✅ | ❌ | ❌ |
| Approve club | ✅ | ❌ | ❌ |
| Join club | ❌ | ✅ | ❌ |
| Mark attendance | ✅ | ❌ | ❌ |

---

## 📊 Data Sync Strategy

### Single Source of Truth
**MongoDB Database** ← All data flows here

### Data Flow
```
Faculty Portal → Backend APIs → MongoDB ← Backend APIs ← Student Portal
     (Write)        (Update)     (Store)    (Query)      (Read)
```

### Status Filtering

**Events:**
- `Published` → Visible to students ✅
- `Draft` → Visible to faculty only (editing)
- `Completed` → Read-only, archived
- `Cancelled` → Hidden

**Clubs:**
- `Active` → Visible to students ✅
- `Pending` → Visible to faculty (approval pending)
- `Suspended` → Hidden temporarily
- `Inactive` → Archived

---

## 🔄 Real-Time WebSocket Updates

### WebSocket URL
```
ws://localhost:8080/ws/events-clubs
```

### Message Types

**1. event_created**
```json
{
  "type": "event_created",
  "data": { /* Event object */ },
  "timestamp": "2024-01-05T10:00:00Z"
}
```

**2. event_updated**
```json
{
  "type": "event_updated",
  "data": { /* Event object */ },
  "timestamp": "2024-01-05T10:01:00Z"
}
```

**3. registration**
```json
{
  "type": "registration",
  "data": {
    "eventId": "123",
    "studentId": "student_1",
    "registrationCount": 32
  },
  "timestamp": "2024-01-05T10:02:00Z"
}
```

**4. club_approved**
```json
{
  "type": "club_approved",
  "data": { /* Club object */ },
  "timestamp": "2024-01-05T10:03:00Z"
}
```

**5. member_joined**
```json
{
  "type": "member_joined",
  "data": {
    "clubId": "456",
    "studentId": "student_1",
    "memberCount": 246
  },
  "timestamp": "2024-01-05T10:04:00Z"
}
```

---

## 🐛 Common Issues & Solutions

### "Module not found: lucide-react"
**Solution**: Remove `Card` from lucide-react imports (it's icons-only)
```javascript
// ❌ Wrong
import { Card, Heart, Calendar } from 'lucide-react';

// ✅ Correct
import { Heart, Calendar } from 'lucide-react';
```

### "Cannot read property 'events' of undefined"
**Solution**: Check API response structure and filtering
```javascript
// Ensure API returns array
const eventsRes = await axios.get(`${API_BASE_URL}/faculty/events`);
const published = eventsRes.data.filter(e => e.status === 'Published');
```

### "WebSocket connection failed"
**Solution**: Check backend running and WebSocket endpoint accessible
```bash
# Test backend health
curl http://localhost:8080/api/faculty/events

# Check WebSocket (use wscat)
npm install -g wscat
wscat -c ws://localhost:8080/ws/events-clubs
```

### "CORS error: Access-Control-Allow-Origin"
**Solution**: Check backend CORS configuration
```java
// In application.properties
server.servlet.context-path=/
cors.allowed-origins=http://localhost:5173
```

### "MongoDB connection refused"
**Solution**: Ensure MongoDB is running on port 27017
```bash
# Check if running
mongosh

# Start if needed
mongod
```

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] Open student portal at http://localhost:5173
- [ ] Load Events tab → Should show published events
- [ ] Click Register on event → Toast should show "Successfully registered"
- [ ] Go to My Events → Should show registered event
- [ ] Open Clubs tab → Should show active clubs
- [ ] Click Join Club → Toast should show "Successfully joined"
- [ ] Switch to Faculty portal
- [ ] Verify registration count increased
- [ ] Create new event (optional)
- [ ] Publish it → Should appear in student portal immediately

### Using cURL

```bash
# Get all events
curl http://localhost:8080/api/faculty/events

# Register for event
curl -X POST http://localhost:8080/api/faculty/events/123/register/student_1

# Get all clubs
curl http://localhost:8080/api/faculty/clubs

# Join club
curl -X POST http://localhost:8080/api/faculty/clubs/456/members/student_1

# Publish event
curl -X PATCH http://localhost:8080/api/faculty/events/123/publish \
  -H "Faculty-Id: faculty_1"
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Project overview |
| QUICK_REFERENCE.md | This file |
| STUDENT_PORTAL_SYNC_GUIDE.md | Integration details |
| PORTAL_SYNC_CHECKLIST.md | Feature verification |
| PORTAL_SYNC_SUMMARY.md | Executive summary |
| ARCHITECTURE_DIAGRAMS_DETAILED.md | Visual diagrams |
| DEPLOYMENT_READY_CHECKLIST.md | Deployment steps |
| FACULTY_CHAT_TESTING_GUIDE.md | Chat module testing |
| FACULTY_PORTAL_IMPLEMENTATION.md | Faculty portal guide |

---

## 🎓 Common Development Tasks

### Add a New Field to Event Model

**1. Update Event.java**
```java
private String newField;  // Add field
```

**2. Update MongoDB schema** (if required)
```javascript
// Migration script (optional)
db.events.updateMany({}, { $set: { newField: null } })
```

**3. Update EventController**
```java
// Include in API response
@GetMapping
public List<Event> getAllEvents() {
    return eventService.getAll();
}
```

**4. Update Frontend**
```javascript
// Add to event display
<p>{event.newField}</p>
```

### Add a New API Endpoint

**1. Add method in EventService.java**
```java
public List<Event> getByCategory(String category) {
    return eventRepository.findByCategory(category);
}
```

**2. Add controller endpoint**
```java
@GetMapping("/category/{category}")
public List<Event> getByCategory(@PathVariable String category) {
    return eventService.getByCategory(category);
}
```

**3. Add to eventAPI.js**
```javascript
export const getEventsByCategory = (category) => {
    return axios.get(`${API_BASE_URL}/faculty/events/category/${category}`);
};
```

**4. Use in components**
```javascript
const events = await eventAPI.getEventsByCategory('workshop');
```

### Deploy to Production

See [DEPLOYMENT_READY_CHECKLIST.md](DEPLOYMENT_READY_CHECKLIST.md)

---

## 📞 Support & Contact

### Getting Help

1. **Check Documentation**: Review relevant .md files first
2. **Review Code**: Look at similar implementations
3. **Check Logs**: `tail -f app.log` for backend errors
4. **Browser Console**: Check for frontend errors
5. **Test APIs**: Use cURL to isolate issues

### Team Contacts

- **Frontend**: [Add contact]
- **Backend**: [Add contact]
- **Database**: [Add contact]
- **DevOps**: [Add contact]

### Issue Tracking

- **Bug Reports**: [Add tracker URL]
- **Feature Requests**: [Add tracker URL]
- **Documentation**: [Add tracker URL]

---

## ✅ Final Checklist Before Going Live

- [ ] Backend running on port 8080
- [ ] Frontend running on port 5173
- [ ] MongoDB connected and populated
- [ ] All 28 APIs tested with cURL
- [ ] Student registration flow working end-to-end
- [ ] Club joining flow working
- [ ] WebSocket real-time updates working
- [ ] Both portals showing same data
- [ ] Error handling displaying correctly
- [ ] Toast notifications working
- [ ] Mobile responsive layout verified
- [ ] No console errors in browser
- [ ] Deployment documentation reviewed
- [ ] Team trained on new features

---

**Status**: ✅ Ready for Production Deployment

**Last Updated**: 2024-01-05  
**Version**: 1.0  
**Author**: Development Team

---

*For complete details, see the comprehensive documentation in the project directory.*
