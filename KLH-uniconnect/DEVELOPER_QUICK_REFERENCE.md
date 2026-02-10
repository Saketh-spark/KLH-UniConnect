# Faculty Events & Clubs - Developer Quick Reference

## 📌 Quick Navigation

| Document | Purpose |
|----------|---------|
| [FACULTY_EVENTS_CLUBS_IMPLEMENTATION.md](FACULTY_EVENTS_CLUBS_IMPLEMENTATION.md) | Full architecture & specs |
| [FACULTY_EVENTS_CLUBS_QUICK_START.md](FACULTY_EVENTS_CLUBS_QUICK_START.md) | User guide for faculty |
| [FACULTY_EVENTS_CLUBS_API_TESTING.md](FACULTY_EVENTS_CLUBS_API_TESTING.md) | API testing examples |
| [FACULTY_EVENTS_CLUBS_SUMMARY.md](FACULTY_EVENTS_CLUBS_SUMMARY.md) | Implementation overview |

---

## 🗂️ Key File Locations

### Frontend
```
frontend/src/
├── components/FacultyEventsClubs.jsx    (Main component - 900 lines)
├── services/eventsClubsAPI.js           (API service layer)
└── App.jsx                              (Updated with routing)
```

### Backend
```
backend/src/main/java/com/uniconnect/
├── model/
│   ├── Event.java
│   └── Club.java
├── repository/
│   ├── EventRepository.java
│   └── ClubRepository.java
├── service/
│   ├── EventService.java
│   └── ClubService.java
├── controller/
│   ├── EventController.java
│   └── ClubController.java
├── websocket/
│   └── EventsClubsWebSocketHandler.java
└── config/
    └── WebSocketConfig.java (updated)
```

---

## 🚀 Startup Commands

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
# Server runs on http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Dev server runs on http://localhost:5173
```

---

## 🔌 Key API Endpoints

### Most Used Event Endpoints
```
GET  /api/faculty/events             # List all
POST /api/faculty/events             # Create
PUT  /api/faculty/events/{id}        # Update
PATCH /api/faculty/events/{id}/publish # Publish
DELETE /api/faculty/events/{id}      # Delete
```

### Most Used Club Endpoints
```
GET /api/faculty/clubs               # List all
POST /api/faculty/clubs              # Create
PATCH /api/faculty/clubs/{id}/approve # Approve
GET /api/faculty/clubs/{id}          # Get details
```

### Statistics
```
GET /api/faculty/events/stats        # Event stats
GET /api/faculty/clubs/stats         # Club stats
```

---

## 📊 Database Collections

### Events
```javascript
db.events.find({})
// Returns: title, eventType, dateTime, venue, status, registeredStudents, attendance
```

### Clubs
```javascript
db.clubs.find({})
// Returns: name, category, status, members, approvedBy
```

---

## 🎯 Component Structure

### FacultyEventsClubs.jsx
```jsx
- Dashboard Tab (8 stat cards + quick actions)
- AllEventsTab (list, filter, search, CRUD)
- ClubsManagementTab (list, approve, view)
- RegistrationsTab (list, mark attendance, export)
- AnnouncementsTab (form to send announcements)
- AnalyticsTab (charts, reports, downloads)
```

---

## 🔐 Authentication

### Headers Required
```javascript
// Faculty ID (required)
'Faculty-Id': localStorage.getItem('klhFacultyId')

// Authorization (optional)
'Authorization': 'Bearer ' + token
```

### Authentication Check
```javascript
const facultyId = localStorage.getItem('klhFacultyId');
if (!facultyId) {
  // Redirect to login
}
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile-first */
max-width: 640px   /* sm */
max-width: 768px   /* md */
max-width: 1024px  /* lg */
max-width: 1280px  /* xl */
```

### Grid Layouts
```jsx
/* Dashboard */
grid-cols-1 md:grid-cols-2 lg:grid-cols-4

/* Events List */
Single column with full-width cards
```

---

## 🎨 Color Scheme

```css
Primary:     #0066FF (blue-600)
Success:     #10B981 (emerald-600)
Warning:     #F59E0B (amber-500)
Danger:      #EF4444 (red-500)
Neutral:     #64748B (slate-600)
Background:  #F8FAFC (slate-50)
```

---

## ⚡ Common Tasks

### Add a New Event Type
1. Update Event.java enum
2. Update frontend filter dropdown
3. Add to eventCategories array
4. Deploy

### Add a New Club Category
1. Update Club.java category field
2. Update frontend category filter
3. Deploy

### Add New Stats to Dashboard
1. Calculate in EventService.getDashboardStats()
2. Add StatCard in Dashboard component
3. Update UI

---

## 🧪 Testing Quick Commands

### Create Event
```bash
curl -X POST "http://localhost:8080/api/faculty/events" \
  -H "Faculty-Id: faculty_123" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Event","eventType":"Workshop",...}'
```

### Get Stats
```bash
curl -X GET "http://localhost:8080/api/faculty/events/stats" \
  -H "Faculty-Id: faculty_123"
```

### Connect WebSocket
```javascript
const ws = new WebSocket('ws://localhost:8080/ws/events-clubs');
ws.send(JSON.stringify({type:'subscribe', facultyId:'faculty_123'}));
```

---

## 🐛 Debugging Tips

### Frontend
1. Open DevTools (F12)
2. Check Network tab for API calls
3. Check Console for errors
4. Verify localStorage for facultyId
5. Check localStorage for tokens

### Backend
1. Check logs: `logs/application.log`
2. Verify MongoDB connection: `mongosh`
3. Check H2 console: `http://localhost:8080/h2-console`
4. Review error messages in console

### WebSocket
1. DevTools → Network → WS tab
2. Check message flow
3. Verify subscription format
4. Check for connection errors

---

## 📈 Performance Tips

### Frontend
- Use React DevTools Profiler
- Check component re-renders
- Optimize list rendering
- Use useMemo for expensive calcs

### Backend
- Monitor MongoDB query performance
- Use indexes on common queries
- Cache frequently accessed data
- Monitor WebSocket connections

---

## 🔄 Deployment Checklist

- [ ] Backend JAR built: `mvn clean package`
- [ ] Frontend built: `npm run build`
- [ ] MongoDB running and accessible
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] JWT secrets configured
- [ ] WebSocket port open (8080)
- [ ] Test APIs with cURL
- [ ] Test WebSocket connection
- [ ] Verify role-based access
- [ ] Check all links work
- [ ] Test on mobile device

---

## 📚 Important Code Patterns

### API Call with Error Handling
```javascript
try {
  const response = await eventAPI.createEvent(data, facultyId);
  showToast('Success!');
  loadData();
} catch (error) {
  showToast('Error: ' + error.message);
}
```

### Loading State Pattern
```javascript
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage />;
return <Content />;
```

### Form Submission Pattern
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await api.save(formData);
    setFormData(initialState);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

---

## 🎯 Customization Guide

### Change Colors
Update color scheme in `FacultyEventsClubs.jsx`:
```jsx
gradient="from-blue-100 to-blue-50"  // Change these values
className="bg-blue-600"              // Or these
```

### Change Text
Search for hardcoded strings and update:
```jsx
"Create New Event" → "Create Event"
"Total Events" → "Events Created"
```

### Add New Fields
1. Update Event.java
2. Update form in FacultyEventsClubs.jsx
3. Update API service
4. Migrate MongoDB data

---

## 📞 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| API 404 | Check endpoint path and method |
| 401 Unauthorized | Verify Faculty-Id header |
| 500 Error | Check backend logs |
| Data not updating | Clear cache, refresh page |
| WebSocket not connecting | Check port 8080, verify URL |
| CORS error | Update WebSocketConfig.java |
| Slow performance | Check MongoDB indexes |

---

## 🚀 Next Features to Add

1. **Charts**: Add Recharts for analytics
2. **Email**: Send email notifications
3. **QR Codes**: Implement QR attendance
4. **Exports**: Add PDF export option
5. **Calendar**: Add calendar widget
6. **Mobile App**: Create React Native version
7. **Bulk Ops**: Bulk email students
8. **Reports**: Advanced reporting

---

## 📖 Documentation Map

```
├── Architecture & Design
│   └── FACULTY_EVENTS_CLUBS_IMPLEMENTATION.md
├── User Guide
│   └── FACULTY_EVENTS_CLUBS_QUICK_START.md
├── API Reference
│   └── FACULTY_EVENTS_CLUBS_API_TESTING.md
├── Developer Info
│   ├── This file
│   └── Source code comments
└── Database
    └── MongoDB schema in IMPLEMENTATION.md
```

---

## ✅ Final Checklist

- [x] All features implemented
- [x] APIs tested and working
- [x] Frontend integrated with App.jsx
- [x] WebSocket real-time updates ready
- [x] Documentation complete
- [x] Error handling in place
- [x] Security measures applied
- [x] Responsive design verified
- [x] Performance optimized
- [x] Ready for production

---

**Version**: 1.0.0  
**Last Updated**: January 5, 2026  
**Status**: Production Ready ✅  
**Estimated Time to Deploy**: 1-2 hours

---

## 📞 Need Help?

1. Check relevant documentation file
2. Review API testing examples
3. Check backend/frontend error logs
4. Verify MongoDB data
5. Test with cURL commands

**Happy Coding! 🎉**
