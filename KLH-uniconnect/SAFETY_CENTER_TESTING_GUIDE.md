# Faculty Safety Center - Quick Start & Testing Guide

## 🚀 Quick Start

### Prerequisites
- Java 11+ installed
- Maven installed
- Node.js & npm installed
- MongoDB connection configured
- Port 8085 (backend) and 4174 (frontend) available

### Step 1: Start Backend
```bash
cd e:\KLH-uniconnect-1\KLH-uniconnect\backend
mvn spring-boot:run
# Or if already built:
java -jar target/backend-0.1.0.jar
```
✅ Backend runs on: http://localhost:8085

### Step 2: Start Frontend
```bash
cd e:\KLH-uniconnect-1\KLH-uniconnect\frontend
npm install
npm run dev
```
✅ Frontend runs on: http://localhost:4174

### Step 3: Access Safety Center
1. Navigate to http://localhost:4174
2. Click "Faculty" role
3. Login with faculty credentials
4. Click "Safety" card on Faculty Dashboard
5. Start managing safety resources!

---

## 🧪 Testing Scenarios

### Test 1: Create Safety Resource
**Path**: Safety Dashboard → Resources Tab
1. Click "New Resource"
2. Fill form:
   - Title: "Campus Fire Exit Locations"
   - Type: "Emergency Information"
   - Phone: "1800-SAFETY-1"
   - Email: "safety@klh.edu.in"
3. Click "Create Resource"
4. ✅ Verify resource appears in list

### Test 2: Create Emergency Alert
**Path**: Safety Dashboard → Alerts Tab
1. Click "Create Alert"
2. Fill form:
   - Title: "Severe Weather Warning"
   - Description: "Thunderstorm expected 2-4 PM"
   - Severity: "Critical" (Red)
   - Location: "Campus-wide"
   - Expiry: 4 hours from now
3. Click "Create Alert"
4. ✅ Verify alert appears with color coding
5. ✅ Verify auto-refresh every 10 seconds

### Test 3: Manage Emergency Contacts
**Path**: Safety Dashboard → Contacts Tab
1. Click "Add Contact"
2. Fill form:
   - Name: "Campus Security"
   - Phone: "9876543210"
   - Category: "Security"
   - Is Primary: ✓ (checked)
3. Click "Create Contact"
4. ✅ Verify primary contact shows 🚨 banner
5. Click star icon to favorite
6. ✅ Verify star highlighting works

### Test 4: Create Safety Guide
**Path**: Safety Dashboard → Guides Tab
1. Click "New Guide"
2. Fill form:
   - Title: "First Aid Basics"
   - Content: "ABC approach - Airway, Breathing, Circulation..."
   - Category: "Health & Wellness"
   - Importance: "High"
   - Read Time: 8 minutes
3. Click "Create Guide"
4. ✅ Guide shows as "Draft"
5. Click green ✓ to approve
6. ✅ Guide changes to "Approved"
7. Click green ✓ again to publish
8. ✅ Guide changes to "Published"

### Test 5: Create Safety Tips
**Path**: Safety Dashboard → Tips Tab
1. Click "New Tip"
2. Fill form:
   - Title: "Phishing Email Prevention"
   - Content: "Don't click unknown links..."
   - Category: "Digital"
   - Risk Level: "Medium"
   - Featured: ✓ (checked)
3. Click "Create Tip"
4. ✅ Tip appears in Featured Tips section
5. Click star on regular tip to feature it
6. ✅ Tip moves to Featured section

### Test 6: Manage Incident Reports
**Path**: Safety Dashboard → Reports Tab
1. View stats showing New/Under Review/Resolved counts
2. Create test report (via API or form):
   ```json
   {
     "title": "Campus Lighting Issue",
     "description": "Broken light near parking lot B",
     "location": "Parking Lot B",
     "reportedBy": "Faculty123"
   }
   ```
3. Click "Review" button
4. Assign to: "Safety Officer"
5. Click "Move to Under Review"
6. ✅ Report status changes to "Under Review"
7. Click "Complete" button
8. Add notes: "Repaired and tested"
9. Click "Mark as Resolved"
10. ✅ Report status changes to "Resolved"

### Test 7: Counseling Requests
**Path**: Safety Dashboard → Counseling Tab
1. View pending/scheduled/completed counts
2. Create test request:
   ```json
   {
     "sessionType": "Individual",
     "studentName": "John Doe",
     "description": "Stress management",
     "preferredTime": "2024-01-15T14:00"
   }
   ```
3. Click "Assign" button
4. Select: "Dr. Sarah Johnson"
5. Pick datetime: 2024-01-15 3:00 PM
6. Click "Schedule Counseling Session"
7. ✅ Status changes to "Scheduled"
8. Click "Complete" button
9. Rate: 5 stars ⭐⭐⭐⭐⭐
10. Add notes: "Positive outcome"
11. Click "Mark Session as Completed"
12. ✅ Status changes to "Completed"

### Test 8: Configure Settings
**Path**: Safety Dashboard → Settings Tab
1. Select years: 2nd, 3rd, 4th (uncheck 1st)
2. ✅ Department checkboxes work
3. Toggle "Emergency-Only Mode"
4. Change "Alert Expiry": 48 hours
5. Toggle "Auto-Archive Reports"
6. Change "Archive After": 60 days
7. Click "Save Settings"
8. ✅ Success message appears
9. Refresh page
10. ✅ Settings persist

---

## 🔍 API Testing (Postman/Curl)

### Test API Health
```bash
curl -X GET http://localhost:8085/api/faculty/safety \
  -H "Faculty-Id: faculty123" \
  -H "Content-Type: application/json"
```

### Create Safety Resource
```bash
curl -X POST http://localhost:8085/api/faculty/safety/resources \
  -H "Faculty-Id: faculty123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "First Aid Kit Location",
    "type": "Emergency Information",
    "phone": "1800-SAFETY",
    "email": "safety@klh.edu.in",
    "location": "Main Building - Ground Floor",
    "visibleToStudents": true
  }'
```

### Create Safety Alert
```bash
curl -X POST http://localhost:8085/api/faculty/safety/alerts \
  -H "Faculty-Id: faculty123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Campus Closure Notice",
    "description": "Campus will be closed on Independence Day",
    "severity": "Warning",
    "location": "Campus-wide",
    "expiryTime": "2024-01-30T23:59:00"
  }'
```

### Get All Resources
```bash
curl -X GET http://localhost:8085/api/faculty/safety/resources \
  -H "Faculty-Id: faculty123" \
  -H "Content-Type: application/json"
```

---

## 📊 Expected Responses

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Campus Fire Exit Locations",
    "type": "Emergency Information",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Title is required",
  "errors": ["title"]
}
```

### Unauthorized Response (401)
```json
{
  "success": false,
  "message": "Faculty-Id header is missing or invalid"
}
```

---

## 🎯 Component Behavior Verification

### SafetyDashboard
- [ ] Renders 9 tabs: Overview | Resources | Contacts | Alerts | Guides | Tips | Reports | Counseling | Settings
- [ ] Stats display correct numbers
- [ ] Tab switching works smoothly
- [ ] Back button returns to Faculty Dashboard

### ActiveAlerts
- [ ] Alerts refresh every 10 seconds
- [ ] Color coding works (red=critical, yellow=warning, blue=info)
- [ ] Expired alerts show correctly
- [ ] Edit/delete buttons functional
- [ ] Create alert form validates input

### SafetyGuides
- [ ] Filter by status shows correct guides
- [ ] Approval workflow: Draft → Approved → Published
- [ ] Read time display correct
- [ ] Importance level color-coded

### SafetyTips
- [ ] Featured tips section shows starred tips
- [ ] Category filtering works
- [ ] Risk level color coding functional
- [ ] Toggle featured status works

### IncidentReports
- [ ] Stats count accurate (New/Under Review/Resolved)
- [ ] Status filtering works
- [ ] Assignment modal appears
- [ ] Resolution modal with notes works
- [ ] Internal notes saved correctly

### CounselingRequests
- [ ] Status counts accurate
- [ ] Counselor assignment dropdown populated
- [ ] Datetime picker functional
- [ ] Star rating system works (1-5 stars)
- [ ] Feedback notes saved

### SafetySettings
- [ ] Year checkboxes toggle correctly
- [ ] Department selection works
- [ ] Emergency-only mode toggle functional
- [ ] Alert expiry hours input accepts numbers
- [ ] Archive settings toggle and persist
- [ ] Save button triggers success message
- [ ] Reset button resets to defaults

---

## 🐛 Common Issues & Solutions

### Issue: "Faculty-Id is undefined"
**Solution**: Make sure you're logged in as Faculty user. Check browser localStorage has 'klhFacultyId' set.

### Issue: "API connection refused"
**Solution**: Verify backend is running on port 8085. Check CORS configuration in backend.

### Issue: "Components not loading"
**Solution**: Check browser console for import errors. Verify all files created in src/components directory.

### Issue: "Empty alert list even after creating"
**Solution**: Check MongoDB connection. Verify API response in Network tab. Check Faculty-Id is being sent correctly.

### Issue: "Can't edit/delete items"
**Solution**: Verify Faculty-Id header is set. Check API endpoint is responding. Look for error messages in console.

---

## 📈 Performance Metrics

### Expected Load Times
- Dashboard load: < 2 seconds
- Tab switch: < 500ms
- API calls: < 1 second
- Alert refresh: every 10 seconds
- Dashboard sync: every 30 seconds

### Browser Compatibility
- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 📋 Checklist Before Going Live

### Backend Checks
- [ ] All 7 models compiling without errors
- [ ] All 7 repositories working
- [ ] All controllers responding
- [ ] MongoDB connection stable
- [ ] CORS headers correct for frontend URL
- [ ] Faculty-Id validation working
- [ ] Error handling implemented

### Frontend Checks
- [ ] All 8 components rendering
- [ ] Navigation between tabs smooth
- [ ] Forms validating input
- [ ] API calls using correct endpoints
- [ ] Faculty-Id header injected in all requests
- [ ] Loading spinners display while fetching
- [ ] Error messages show on API failures
- [ ] Success messages show on create/update/delete

### Integration Checks
- [ ] SafetyDashboard accessible from Faculty Dashboard
- [ ] "Safety" module card in dashboard clickable
- [ ] Back button returns to Faculty Dashboard
- [ ] All 9 modules accessible from tabs
- [ ] Real-time sync working (auto-refresh)

### Data Validation
- [ ] Required fields enforced
- [ ] Date/time picker working
- [ ] Dropdown selections working
- [ ] Multi-select working (checkboxes)
- [ ] Radio buttons functional
- [ ] Text inputs accept correct format

---

## 🎓 Training Notes for Faculty

### Creating an Alert
1. Go to Safety Center → Alerts tab
2. Click "Create Alert"
3. Fill in title and description
4. Select severity level (Info/Warning/Critical)
5. Set expiry time (when alert should auto-close)
6. Click "Create Alert"
7. Alert appears in real-time to all students

### Best Practices
- **Resource Info**: Keep phone numbers and emails updated
- **Alert Severity**: Use "Critical" only for emergencies
- **Guide Content**: Write guides in simple, clear language
- **Tips**: Keep tips short (< 100 words) and actionable
- **Incident Reports**: Add detailed notes for resolution
- **Settings**: Review visibility settings each semester

---

## 📞 Support Contacts

For implementation support:
- Backend issues: Check Spring Boot logs in backend directory
- Frontend issues: Open Developer Tools (F12) and check Console
- API issues: Use Postman to test endpoints directly
- Database issues: Check MongoDB Atlas connection status

---

**Last Updated**: 2024
**Version**: 1.0 (Complete)
**Status**: Ready for Testing ✅
