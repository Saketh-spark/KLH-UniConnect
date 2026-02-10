# 🚀 Analytics System - Deployment & Setup Guide

## Quick Start (5 Minutes)

### Prerequisites
- ✅ Java 11+
- ✅ Node.js 16+
- ✅ MongoDB (running on port 27017)
- ✅ Maven
- ✅ npm

### Step 1: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Build the project
mvn clean package -DskipTests

# Run the Spring Boot server
mvn spring-boot:run

# Server will start on http://localhost:8085
```

### Step 2: Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev

# Client will start on http://localhost:4173
```

### Step 3: Access Analytics
1. Open http://localhost:4173 in browser
2. Select Role (Student/Faculty)
3. Login with credentials
4. Navigate to Analytics section

---

## 🔧 Configuration Files

### Backend Configuration
**File:** `application.properties`

```properties
# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/uniconnect
spring.data.mongodb.database=uniconnect

# Server Port
server.port=8085

# Logging
logging.level.root=INFO
logging.level.com.klh.uniconnect=DEBUG
```

### Frontend Configuration
**File:** `analyticsAPI.js`

```javascript
const API_BASE_URL = 'http://localhost:8085/api/analytics';

// Polling intervals
const STUDENT_REFRESH_INTERVAL = 15000;  // 15 seconds
const FACULTY_REFRESH_INTERVAL = 20000;  // 20 seconds
```

---

## 📦 Project Structure

```
uniconnect/
├── backend/
│   ├── src/main/java/com/klh/uniconnect/
│   │   ├── model/
│   │   │   ├── StudentAnalytics.java
│   │   │   ├── SkillAnalytics.java
│   │   │   ├── Goal.java
│   │   │   ├── AnalyticsReport.java
│   │   │   └── AnalyticsFeedback.java
│   │   ├── repository/
│   │   │   ├── StudentAnalyticsRepository.java
│   │   │   ├── SkillAnalyticsRepository.java
│   │   │   ├── GoalRepository.java
│   │   │   ├── AnalyticsReportRepository.java
│   │   │   └── AnalyticsFeedbackRepository.java
│   │   ├── service/
│   │   │   ├── StudentAnalyticsService.java
│   │   │   ├── SkillAnalyticsService.java
│   │   │   ├── GoalService.java
│   │   │   ├── ReportService.java
│   │   │   └── FeedbackService.java
│   │   └── controller/
│   │       ├── AnalyticsController.java
│   │       ├── SkillAnalyticsController.java
│   │       ├── GoalController.java
│   │       ├── ReportController.java
│   │       └── FeedbackController.java
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StudentAnalytics.jsx
│   │   │   └── FacultyAnalytics.jsx
│   │   ├── services/
│   │   │   └── analyticsAPI.js
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── ANALYTICS_DOCUMENTATION.md
```

---

## 🔍 Testing the Analytics System

### Test 1: Fetch Student Analytics
```bash
curl -X GET http://localhost:8085/api/analytics/student/STU001
```

**Expected Response:**
```json
{
  "success": true,
  "analytics": {
    "studentId": "STU001",
    "studentName": "John Doe",
    "currentGPA": 3.8,
    "overallPerformanceScore": 85,
    "placementReadinessScore": 75,
    "activeGoalsCount": 3,
    "skillsTrackedCount": 5
  }
}
```

### Test 2: Add a Skill
```bash
curl -X POST http://localhost:8085/api/analytics/skills/add \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU001",
    "skillName": "Python",
    "category": "Technical",
    "proficiencyPercentage": 75
  }'
```

### Test 3: Create a Goal
```bash
curl -X POST http://localhost:8085/api/analytics/goals/create \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU001",
    "title": "Master Data Structures",
    "description": "Complete DSA course on Udemy",
    "category": "Skill Development",
    "priority": "High",
    "targetDate": "2026-03-31T00:00:00"
  }'
```

### Test 4: Add Feedback
```bash
curl -X POST http://localhost:8085/api/analytics/feedback/add \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU001",
    "facultyId": "FAC001",
    "feedbackType": "Performance Feedback",
    "content": "Excellent progress in recent assignments",
    "category": "Academics",
    "sentiment": "Positive"
  }'
```

---

## 🌐 Deployment Instructions

### Deployment on Production Server

#### 1. Build Backend JAR
```bash
cd backend
mvn clean package
# JAR file created at: target/backend-0.1.0.jar
```

#### 2. Build Frontend
```bash
cd frontend
npm run build
# Build files created at: dist/
```

#### 3. Deploy Backend
```bash
# Copy JAR to server
scp backend-0.1.0.jar user@server:/app/

# Run on server
java -jar backend-0.1.0.jar
```

#### 4. Deploy Frontend
```bash
# Copy build files to web server
scp -r dist/* user@server:/var/www/html/

# Update API base URL for production
# In analyticsAPI.js: const API_BASE_URL = 'https://your-domain.com/api/analytics';
```

#### 5. Update Environment Variables
```bash
# On production server
export SPRING_DATA_MONGODB_URI=mongodb://prod-server:27017/uniconnect
export SERVER_PORT=8085
```

---

## 📊 Database Seeding (Optional)

### Create Sample Data
```bash
# MongoDB Query
use uniconnect

# Insert sample student analytics
db.student_analytics.insertOne({
  studentId: "STU001",
  studentName: "John Doe",
  email: "john@example.com",
  department: "CSE",
  semester: "6",
  currentGPA: 3.8,
  gpaTarget: 4.0,
  overallPerformanceScore: 85,
  placementReadinessScore: 75,
  activeGoalsCount: 3,
  skillsTrackedCount: 5,
  hoursSpentAcademics: 150,
  hoursSpentSkills: 120,
  hoursSpentPlacements: 80,
  gpaTrend: [
    { week: "Week 1", gpa: 3.5, date: new Date() }
  ],
  createdAt: new Date(),
  lastUpdated: new Date()
})
```

---

## ⚙️ Performance Optimization

### 1. Database Indexing
```javascript
// Add indexes in MongoDB for faster queries
db.student_analytics.createIndex({ studentId: 1 })
db.skill_analytics.createIndex({ studentId: 1 })
db.goals.createIndex({ studentId: 1, status: 1 })
db.analytics_feedback.createIndex({ studentId: 1, isRead: 1 })
```

### 2. Caching Strategy
```javascript
// Frontend: Use React Query for caching
// Backend: Implement Redis for session caching
// Frontend polling: Adjust intervals based on data change frequency
```

### 3. API Response Optimization
```javascript
// Use pagination for large datasets
GET /api/analytics/goals/student/{studentId}?page=1&limit=10

// Use field filtering
GET /api/analytics/student/{studentId}?fields=gpa,performance
```

---

## 🔒 Security Checklist

- [ ] Enable HTTPS on production
- [ ] Validate JWT tokens on all endpoints
- [ ] Implement rate limiting (e.g., 100 req/min per user)
- [ ] Sanitize all input data
- [ ] Encrypt sensitive data in MongoDB
- [ ] Enable CORS only for trusted domains
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Regular security audits
- [ ] Log all user actions for audit trail

---

## 🐛 Troubleshooting

### Backend Issues

**Issue:** Port 8085 already in use
```bash
# Find and kill process
lsof -i :8085
kill -9 <PID>
```

**Issue:** MongoDB connection failed
```bash
# Check MongoDB status
mongod --version
# Ensure MongoDB is running on port 27017
netstat -an | grep 27017
```

**Issue:** Build failures
```bash
# Clean and rebuild
mvn clean install -U
# Check Java version (requires 11+)
java -version
```

### Frontend Issues

**Issue:** CORS errors
```javascript
// Ensure backend has @CrossOrigin
// Check API_BASE_URL matches backend server
```

**Issue:** Slow performance
```javascript
// Check network tab in DevTools
// Reduce polling frequency if needed
// Enable compression in production
```

---

## 📈 Monitoring & Logs

### Backend Logs
```bash
# Check Spring Boot logs
tail -f catalina.out

# Enable debug logging
-Dlogging.level.com.klh.uniconnect=DEBUG
```

### Frontend Logs
```bash
# Browser Console
console.log('Analytics data:', analytics);

# Network requests
Chrome DevTools → Network tab → Filter 'analytics'
```

### Database Logs
```bash
# MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Monitor queries
db.setProfilingLevel(1, { slowms: 100 })
```

---

## 📞 Support & Maintenance

### Regular Maintenance
- Weekly database backups
- Monthly security updates
- Performance monitoring
- User feedback collection

### Update Procedure
```bash
# Backup database
mongodump --out=/backup/

# Update backend
git pull origin main
mvn clean package
# Restart service

# Update frontend
npm run build
# Deploy new build
```

---

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Axios Documentation](https://axios-http.com)

---

## ✅ Deployment Checklist

- [ ] Backend builds successfully
- [ ] Frontend builds successfully
- [ ] All API endpoints tested
- [ ] Database migrations complete
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Documentation updated
- [ ] Team trained on new system

---

**Version:** 1.0.0  
**Last Updated:** January 5, 2026  
**Status:** ✅ Ready for Deployment
