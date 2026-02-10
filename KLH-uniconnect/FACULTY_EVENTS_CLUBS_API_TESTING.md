# Faculty Events & Clubs - API Testing Guide

## 🧪 Testing the APIs

This guide provides examples for testing all Faculty Events & Clubs endpoints using cURL, Postman, or your preferred API client.

---

## 🔑 Authentication

All requests require:
- **Faculty ID Header**: `Faculty-Id: faculty_123`
- **Authorization**: Optional JWT token in Authorization header

---

## 📅 Event API Endpoints

### 1. Get All Events
```bash
curl -X GET "http://localhost:8080/api/faculty/events" \
  -H "Faculty-Id: faculty_123"
```

**Response**: Array of all events in the system

---

### 2. Get Faculty's Events
```bash
curl -X GET "http://localhost:8080/api/faculty/events/my-events" \
  -H "Faculty-Id: faculty_123"
```

**Response**: Only events created by this faculty member

---

### 3. Get Event by ID
```bash
curl -X GET "http://localhost:8080/api/faculty/events/event_id_here" \
  -H "Faculty-Id: faculty_123"
```

**Response**: Detailed event information

---

### 4. Create Event
```bash
curl -X POST "http://localhost:8080/api/faculty/events" \
  -H "Faculty-Id: faculty_123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Advanced Workshop",
    "description": "Learn advanced React patterns and hooks",
    "eventType": "Workshop",
    "dateTime": "2024-02-20T10:00:00Z",
    "venue": "Tech Lab A, Block 3",
    "maxParticipants": 50,
    "registrationDeadline": "2024-02-15T23:59:59Z",
    "bannerUrl": "https://example.com/image.jpg",
    "clubId": "club_123",
    "departmentId": "dept_456",
    "status": "Draft"
  }'
```

**Response**: Created event object with ID

---

### 5. Update Event
```bash
curl -X PUT "http://localhost:8080/api/faculty/events/event_id_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Advanced Workshop - UPDATED",
    "description": "Learn advanced React patterns, hooks, and testing",
    "eventType": "Workshop",
    "dateTime": "2024-02-21T10:00:00Z",
    "venue": "Tech Lab B, Block 3",
    "maxParticipants": 60,
    "registrationDeadline": "2024-02-16T23:59:59Z"
  }'
```

**Response**: Updated event object

---

### 6. Delete Event
```bash
curl -X DELETE "http://localhost:8080/api/faculty/events/event_id_here"
```

**Response**: 204 No Content (success)

---

### 7. Publish Event
```bash
curl -X PATCH "http://localhost:8080/api/faculty/events/event_id_here/publish" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response**: Event with status changed to "Published"

---

### 8. Get Dashboard Stats
```bash
curl -X GET "http://localhost:8080/api/faculty/events/stats" \
  -H "Faculty-Id: faculty_123"
```

**Response**:
```json
{
  "totalEvents": 8,
  "upcomingEvents": 3,
  "pastEvents": 5,
  "publishedEvents": 7,
  "totalRegistrations": 156,
  "attendancePercentage": 87.5
}
```

---

### 9. Register Student for Event
```bash
curl -X POST "http://localhost:8080/api/faculty/events/event_id/register/student_id" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response**: Event object with updated registration count

---

### 10. Mark Attendance
```bash
curl -X POST "http://localhost:8080/api/faculty/events/event_id/attendance" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student_123",
    "studentName": "John Doe",
    "studentEmail": "john@klh.edu.in"
  }'
```

**Response**: Event with attendance record added

---

### 11. Export Registrations
```bash
curl -X GET "http://localhost:8080/api/faculty/events/event_id/registrations/export" \
  -H "Faculty-Id: faculty_123" \
  -o registrations.csv
```

**Response**: CSV file with student registrations

---

### 12. Search Events
```bash
curl -X GET "http://localhost:8080/api/faculty/events/search?query=Workshop" \
  -H "Faculty-Id: faculty_123"
```

**Response**: Array of matching events

---

### 13. Filter by Event Type
```bash
curl -X GET "http://localhost:8080/api/faculty/events/type/Workshop" \
  -H "Faculty-Id: faculty_123"
```

**Response**: Array of events of specified type

---

### 14. Get Events by Date Range
```bash
curl -X GET "http://localhost:8080/api/faculty/events/date-range?startDate=2024-02-01T00:00:00Z&endDate=2024-02-28T23:59:59Z" \
  -H "Faculty-Id: faculty_123"
```

**Response**: Array of events within date range

---

## 👥 Club API Endpoints

### 1. Get All Clubs
```bash
curl -X GET "http://localhost:8080/api/faculty/clubs" \
  -H "Faculty-Id: faculty_123"
```

**Response**: Array of all clubs

---

### 2. Get Faculty's Clubs
```bash
curl -X GET "http://localhost:8080/api/faculty/clubs/my-clubs" \
  -H "Faculty-Id: faculty_123"
```

**Response**: Clubs managed/coordinated by this faculty

---

### 3. Get Club by ID
```bash
curl -X GET "http://localhost:8080/api/faculty/clubs/club_id_here" \
  -H "Faculty-Id: faculty_123"
```

**Response**: Detailed club information

---

### 4. Create Club
```bash
curl -X POST "http://localhost:8080/api/faculty/clubs" \
  -H "Faculty-Id: faculty_123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Data Science Club",
    "description": "Learn and share knowledge about data science and machine learning",
    "category": "Technical",
    "iconUrl": "https://example.com/icon.png",
    "bannerUrl": "https://example.com/banner.png",
    "clubPresident": "student_456"
  }'
```

**Response**: Created club object

---

### 5. Update Club
```bash
curl -X PUT "http://localhost:8080/api/faculty/clubs/club_id_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Data Science & Analytics Club",
    "description": "Learn data science, machine learning, and analytics",
    "category": "Technical"
  }'
```

**Response**: Updated club object

---

### 6. Approve Club
```bash
curl -X PATCH "http://localhost:8080/api/faculty/clubs/club_id_here/approve" \
  -H "Faculty-Id: faculty_123" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response**: Club with status "Active"

---

### 7. Reject Club
```bash
curl -X PATCH "http://localhost:8080/api/faculty/clubs/club_id_here/reject" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response**: Club with status "Rejected"

---

### 8. Suspend Club
```bash
curl -X PATCH "http://localhost:8080/api/faculty/clubs/club_id_here/suspend" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response**: Club with status "Suspended"

---

### 9. Delete Club
```bash
curl -X DELETE "http://localhost:8080/api/faculty/clubs/club_id_here"
```

**Response**: 204 No Content

---

### 10. Add Member to Club
```bash
curl -X POST "http://localhost:8080/api/faculty/clubs/club_id/members/student_id" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response**: Club with student added

---

### 11. Remove Member from Club
```bash
curl -X DELETE "http://localhost:8080/api/faculty/clubs/club_id/members/student_id"
```

**Response**: Club with student removed

---

### 12. Get Dashboard Stats
```bash
curl -X GET "http://localhost:8080/api/faculty/clubs/stats" \
  -H "Faculty-Id: faculty_123"
```

**Response**:
```json
{
  "totalClubs": 12,
  "activeClubs": 10,
  "pendingClubs": 2,
  "facultyClubs": 5,
  "totalMembers": 450
}
```

---

### 13. Filter by Category
```bash
curl -X GET "http://localhost:8080/api/faculty/clubs/category/Technical" \
  -H "Faculty-Id: faculty_123"
```

**Response**: Array of clubs in specified category

---

### 14. Search Clubs
```bash
curl -X GET "http://localhost:8080/api/faculty/clubs/search?query=Data" \
  -H "Faculty-Id: faculty_123"
```

**Response**: Array of matching clubs

---

## 🔄 WebSocket Real-time Updates

### Connect to WebSocket
```javascript
const socket = new WebSocket('ws://localhost:8080/ws/events-clubs');

socket.onopen = () => {
  console.log('Connected');
  
  // Subscribe to faculty updates
  socket.send(JSON.stringify({
    type: 'subscribe',
    facultyId: 'faculty_123'
  }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  
  // Handle different message types
  switch(data.type) {
    case 'event_created':
      console.log('New event created:', data.event);
      break;
    case 'event_updated':
      console.log('Event updated:', data.event);
      break;
    case 'registration':
      console.log('New registration:', data);
      break;
    case 'attendance_marked':
      console.log('Attendance marked:', data);
      break;
    case 'club_approved':
      console.log('Club approved:', data.club);
      break;
  }
};

socket.onerror = (error) => {
  console.error('WebSocket error:', error);
};

socket.onclose = () => {
  console.log('Disconnected');
};
```

### WebSocket Message Examples

**Event Created**:
```json
{
  "type": "event_created",
  "event": {
    "_id": "evt_123",
    "title": "React Workshop",
    "eventType": "Workshop",
    "dateTime": "2024-02-20T10:00:00Z"
  },
  "timestamp": 1704456000000
}
```

**New Registration**:
```json
{
  "type": "registration",
  "eventId": "evt_123",
  "studentId": "std_456",
  "timestamp": 1704456000000
}
```

**Attendance Marked**:
```json
{
  "type": "attendance_marked",
  "eventId": "evt_123",
  "studentId": "std_456",
  "timestamp": 1704456000000
}
```

---

## 📊 Test Data

### Sample Event
```json
{
  "title": "Full Stack Development Workshop",
  "description": "Learn MERN stack: MongoDB, Express, React, Node.js",
  "eventType": "Workshop",
  "dateTime": "2024-02-25T10:00:00Z",
  "venue": "Computer Lab 1, Block A",
  "maxParticipants": 40,
  "registrationDeadline": "2024-02-20T23:59:59Z",
  "bannerUrl": "https://example.com/fullstack.jpg"
}
```

### Sample Club
```json
{
  "name": "Competitive Programming Club",
  "description": "Master DSA and competitive coding for placements",
  "category": "Technical",
  "iconUrl": "https://example.com/cp-icon.png",
  "clubPresident": "student_789"
}
```

---

## ✅ Test Checklist

- [ ] Create an event
- [ ] Publish the event
- [ ] Register a student for the event
- [ ] Mark attendance
- [ ] Export registrations
- [ ] Search for events
- [ ] Create a club
- [ ] Approve the club
- [ ] Add member to club
- [ ] Get dashboard stats
- [ ] Receive WebSocket updates
- [ ] Update event details
- [ ] Delete event
- [ ] Suspend club

---

## 🐛 Common Test Issues

### 401 Unauthorized
**Issue**: Missing Faculty-Id header  
**Solution**: Add `-H "Faculty-Id: faculty_123"` to all requests

### 404 Not Found
**Issue**: Invalid ID format  
**Solution**: Verify IDs exist by listing all items first

### 400 Bad Request
**Issue**: Invalid JSON in request body  
**Solution**: Validate JSON syntax and required fields

### 500 Internal Server Error
**Issue**: Backend error  
**Solution**: Check backend logs and MongoDB connection

---

## 📈 Performance Testing

### Bulk Create Events
```bash
for i in {1..100}; do
  curl -X POST "http://localhost:8080/api/faculty/events" \
    -H "Faculty-Id: faculty_123" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"Event $i\",
      \"description\": \"Test event\",
      \"eventType\": \"Workshop\",
      \"dateTime\": \"2024-02-${i % 28 + 1}T10:00:00Z\",
      \"venue\": \"Lab $i\"
    }"
done
```

---

**Last Updated**: January 5, 2026  
**Module Version**: 1.0.0
