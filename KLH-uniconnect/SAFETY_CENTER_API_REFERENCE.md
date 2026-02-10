# Faculty Safety Center - API Reference

## Base URL
```
http://localhost:8085/api/faculty/safety
```

## Authentication
All requests require the `Faculty-Id` header:
```
Headers: {
  'Faculty-Id': 'your-faculty-id',
  'Content-Type': 'application/json'
}
```

---

## 📦 Safety Resources Endpoints

### Create Resource
```
POST /resources
Content-Type: application/json

{
  "title": "string (required)",
  "type": "string (Emergency Information | Support Service | Educational Resource)",
  "phone": "string",
  "email": "string",
  "availability": "string (24/7 | Office Hours | By Appointment)",
  "priorityLevel": "number (1-5)",
  "isActive": "boolean",
  "visibleToStudents": "boolean",
  "location": "string",
  "tags": ["string"]
}
```

### Get All Resources
```
GET /resources
Query Parameters:
  - type: Filter by type
  - visible: true/false
  - status: active/inactive
```

### Get Resource by ID
```
GET /resources/{id}
```

### Update Resource
```
PUT /resources/{id}
Content-Type: application/json

{
  "title": "string",
  "type": "string",
  // ... other fields to update
}
```

### Delete Resource
```
DELETE /resources/{id}
```

### Toggle Visibility
```
PATCH /resources/{id}/visibility
```

---

## 📞 Emergency Contacts Endpoints

### Create Contact
```
POST /contacts
Content-Type: application/json

{
  "name": "string (required)",
  "phone": "string (required)",
  "email": "string",
  "category": "string (Security | Medical | Counseling | Admin)",
  "isPrimary": "boolean",
  "priority": "number (1=highest)",
  "isActive": "boolean",
  "location": "string"
}
```

### Get All Contacts
```
GET /contacts
Query Parameters:
  - category: Filter by category
  - primary: true/false
  - sort: priority (ascending)
```

### Get Contact by ID
```
GET /contacts/{id}
```

### Update Contact
```
PUT /contacts/{id}
Content-Type: application/json

{
  "name": "string",
  "phone": "string",
  // ... other fields
}
```

### Set Primary Contact
```
PATCH /contacts/{id}/set-primary
```

### Delete Contact
```
DELETE /contacts/{id}
```

---

## 🚨 Safety Alerts Endpoints

### Create Alert
```
POST /alerts
Content-Type: application/json

{
  "title": "string (required)",
  "description": "string (required)",
  "type": "string (Safety Warning | Maintenance Work | Cyber Alert | Lost Items)",
  "severity": "string (Info | Warning | Critical)",
  "location": "string (Campus-wide | Building A | etc)",
  "expiryTime": "ISO8601 datetime (2024-01-15T14:30:00Z)",
  "isActive": "boolean"
}
```

### Get All Alerts
```
GET /alerts
Query Parameters:
  - severity: Info/Warning/Critical
  - active: true/false
  - location: string
```

### Get Alert by ID
```
GET /alerts/{id}
```

### Update Alert
```
PUT /alerts/{id}
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  // ... other fields
}
```

### Close Alert
```
PATCH /alerts/{id}/close
Content-Type: application/json

{
  "reason": "string (Resolved | Not Applicable | Duplicate)"
}
```

### Increment View Count
```
PATCH /alerts/{id}/view
```

### Delete Alert
```
DELETE /alerts/{id}
```

### Auto-Expire Alerts
```
POST /alerts/auto-expire
```

---

## 📖 Safety Guides Endpoints

### Create Guide
```
POST /guides
Content-Type: application/json

{
  "title": "string (required)",
  "content": "string (required)",
  "category": "string (General Safety | Cybersecurity | Health & Wellness | Campus Safety)",
  "importanceLevel": "string (Low | Medium | High | Critical)",
  "readTimeMinutes": "number",
  "tags": ["string"]
}
```

### Get All Guides
```
GET /guides
Query Parameters:
  - category: string
  - status: draft/approved/published
  - importance: Low/Medium/High/Critical
```

### Get Guide by ID
```
GET /guides/{id}
```

### Update Guide
```
PUT /guides/{id}
Content-Type: application/json

{
  "title": "string",
  "content": "string",
  // ... other fields
}
```

### Approve Guide
```
PATCH /guides/{id}/approve
Content-Type: application/json

{
  "reviewedBy": "string (Faculty name or ID)"
}
```

### Publish Guide
```
PATCH /guides/{id}/publish
```

### Delete Guide
```
DELETE /guides/{id}
```

---

## 💡 Safety Tips Endpoints

### Create Tip
```
POST /tips
Content-Type: application/json

{
  "title": "string (required)",
  "content": "string (required)",
  "category": "string (Personal | Digital | Health | Travel)",
  "riskLevel": "string (Low | Medium | High)",
  "isFeatured": "boolean",
  "displayOrder": "number"
}
```

### Get All Tips
```
GET /tips
Query Parameters:
  - category: Personal/Digital/Health/Travel
  - featured: true/false
  - riskLevel: Low/Medium/High
  - sort: displayOrder (ascending)
```

### Get Tip by ID
```
GET /tips/{id}
```

### Update Tip
```
PUT /tips/{id}
Content-Type: application/json

{
  "title": "string",
  "content": "string",
  "isFeatured": "boolean",
  // ... other fields
}
```

### Toggle Featured Status
```
PATCH /tips/{id}/toggle-featured
```

### Delete Tip
```
DELETE /tips/{id}
```

---

## 🚨 Incident Reports Endpoints

### Create Incident Report
```
POST /incident-reports
Content-Type: application/json

{
  "title": "string (required)",
  "description": "string (required)",
  "location": "string",
  "reportedBy": "string (Faculty ID or name)",
  "type": "string (Safety Concern | Accident | Vandalism | etc)",
  "isConfidential": "boolean",
  "requiresAnonymity": "boolean"
}
```

### Get All Incident Reports
```
GET /incident-reports
Query Parameters:
  - status: New/Under Review/Resolved
  - type: string
  - location: string
  - includeResolved: true/false
```

### Get Report by ID
```
GET /incident-reports/{id}
```

### Update Report
```
PUT /incident-reports/{id}
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  // ... other fields
}
```

### Assign Report
```
PATCH /incident-reports/{id}/assign
Content-Type: application/json

{
  "assignedTo": "string (Faculty name or ID)"
}
```

### Resolve Report
```
PATCH /incident-reports/{id}/resolve
Content-Type: application/json

{
  "internalNotes": "string (what was done to resolve)",
  "resolution": "string (optional description of resolution)"
}
```

### Delete Report (Soft Delete)
```
DELETE /incident-reports/{id}
```

### Restore Deleted Report
```
PATCH /incident-reports/{id}/restore
```

---

## 🎓 Counseling Sessions Endpoints

### Create Counseling Request
```
POST /counseling-sessions
Content-Type: application/json

{
  "studentName": "string (required)",
  "sessionType": "string (Individual | Group)",
  "description": "string (reason for counseling)",
  "contactNumber": "string",
  "preferredTime": "ISO8601 datetime",
  "bookingStatus": "string (Pending | Scheduled | Completed)"
}
```

### Get All Counseling Sessions
```
GET /counseling-sessions
Query Parameters:
  - status: Pending/Scheduled/Completed
  - counselor: string
  - type: Individual/Group
```

### Get Session by ID
```
GET /counseling-sessions/{id}
```

### Update Session
```
PUT /counseling-sessions/{id}
Content-Type: application/json

{
  "studentName": "string",
  "description": "string",
  // ... other fields
}
```

### Assign Counselor
```
PATCH /counseling-sessions/{id}/assign-counselor
Content-Type: application/json

{
  "counselor": "string (Counselor name or ID)",
  "scheduledTime": "ISO8601 datetime (2024-01-15T14:00:00Z)"
}
```

### Close Session
```
PATCH /counseling-sessions/{id}/close
Content-Type: application/json

{
  "internalNotes": "string (session summary and recommendations)",
  "feedbackRating": "number (1-5 stars)"
}
```

### Delete Session
```
DELETE /counseling-sessions/{id}
```

---

## ⚙️ Safety Settings Endpoints

### Get Settings
```
GET /settings
```

### Update Settings
```
PUT /settings
Content-Type: application/json

{
  "visibleToYears": ["1st", "2nd", "3rd", "4th"],
  "visibleToDepartments": ["Engineering", "Science", "Commerce"],
  "emergencyOnlyMode": "boolean",
  "autoExpireAlerts": "boolean",
  "alertExpiryHours": "number",
  "requireConfirmation": "boolean",
  "enableNotifications": "boolean",
  "notificationChannels": ["Email", "In-App", "SMS"],
  "hideIdentity": "boolean",
  "archiveOldReports": "boolean",
  "archiveAfterDays": "number"
}
```

---

## 📊 Dashboard Endpoints

### Get Dashboard Overview
```
GET /dashboard
Response:
{
  "totalResources": "number",
  "activeResources": "number",
  "emergencyContacts": "number",
  "activeAlerts": "number",
  "pendingReports": "number",
  "recentAlerts": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "severity": "string",
      "location": "string",
      "color": "red|yellow|blue"
    }
  ]
}
```

---

## 🔄 Sync Endpoints

### Sync All Data
```
POST /sync
Query Parameters:
  - lastSyncTime: ISO8601 datetime (optional)
  
Response:
{
  "resources": [...],
  "contacts": [...],
  "alerts": [...],
  "guides": [...],
  "tips": [...],
  "reports": [...],
  "sessions": [...],
  "lastSyncTime": "ISO8601 datetime"
}
```

---

## Error Response Format

### Success (2xx)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Client Error (4xx)
```json
{
  "success": false,
  "message": "Description of error",
  "errors": ["field1", "field2"]
}
```

### Server Error (5xx)
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

---

## Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | GET successful, data returned |
| 201 | Created | POST successful, resource created |
| 204 | No Content | DELETE successful, no data returned |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Faculty-Id header missing/invalid |
| 403 | Forbidden | Faculty doesn't have permission |
| 404 | Not Found | Resource ID doesn't exist |
| 500 | Server Error | Database or server issue |

---

## Example Workflows

### Complete Alert Creation Workflow
```
1. POST /alerts (create alert)
   ↓
2. GET /alerts (verify alert created)
   ↓
3. PATCH /alerts/{id}/view (student views)
   ↓
4. PATCH /alerts/{id}/close (faculty closes)
   ↓
5. DELETE /alerts/{id} (optional: remove)
```

### Complete Guide Publication Workflow
```
1. POST /guides (create guide)
   ↓ (Status: Draft)
2. PUT /guides/{id} (edit if needed)
   ↓
3. PATCH /guides/{id}/approve (faculty approves)
   ↓ (Status: Approved)
4. PATCH /guides/{id}/publish (make public)
   ↓ (Status: Published)
5. GET /guides (visible to students)
```

### Complete Incident Report Workflow
```
1. POST /incident-reports (create report)
   ↓ (Status: New)
2. PATCH /incident-reports/{id}/assign (assign staff)
   ↓ (Status: Under Review)
3. PUT /incident-reports/{id} (add updates)
   ↓
4. PATCH /incident-reports/{id}/resolve (close & document)
   ↓ (Status: Resolved)
```

### Complete Counseling Session Workflow
```
1. POST /counseling-sessions (create request)
   ↓ (Status: Pending)
2. PATCH /counseling-sessions/{id}/assign-counselor (schedule)
   ↓ (Status: Scheduled)
3. PATCH /counseling-sessions/{id}/close (complete & rate)
   ↓ (Status: Completed)
```

---

## Rate Limiting
Currently: No rate limiting (unlimited requests)
Recommended: 100 requests per minute per Faculty-Id

---

## API Version
Current Version: 1.0
Date: 2024

---

## Testing Tools
- **Postman**: Import this documentation as API collection
- **curl**: Use examples above with curl commands
- **JavaScript/Node.js**: Use Axios (see safetyAPI.js)
- **Browser**: Use Fetch API or Axios

---

**Last Updated**: 2024
**API Status**: ✅ Ready for Testing
**Total Endpoints**: 40+
