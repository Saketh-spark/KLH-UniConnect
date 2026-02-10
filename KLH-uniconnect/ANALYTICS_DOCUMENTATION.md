# 📊 Analytics System Documentation

## Overview

The Analytics system provides comprehensive tracking of student academic, skill, and placement performance with role-based access for students and faculty.

---

## 🎯 Features

### Student Analytics Module
✅ **Overview Dashboard**
- Overall performance score (0-100)
- GPA trend tracking (week/month/semester)
- Placement readiness score
- Active goals count
- Skills tracked count
- Time investment by category

✅ **Skills Analytics**
- Skill proficiency percentage
- Proficiency level (Beginner/Intermediate/Expert)
- Endorsements count
- Last updated timestamp
- Category-based filtering

✅ **Goals & Activity**
- Active goals assigned by faculty
- Milestones completion tracking
- Progress bars
- Status indicators (On Track / Needs Work)
- Faculty feedback on goals

✅ **Reports**
- Monthly Academic Report
- Skills Development Report
- Placement Readiness Report
- View and download reports

### Faculty Analytics Module
✅ **Dashboard Overview**
- Total students monitored
- Average GPA across students
- Average placement readiness score
- Students at risk (low GPA/readiness)
- High performers identification

✅ **Student-Wise Analytics**
- Individual academic trends
- Skill proficiency matrix
- Goal progress tracking
- Placement readiness per student

✅ **Comparison & Insights**
- Compare students or batches
- Performance distribution charts
- Identify weak areas
- Department/semester analysis

✅ **Faculty Actions**
- Add remarks & feedback
- Set or update goals
- Flag students (Needs Attention)
- Recommend actions

---

## 🏗️ Architecture

### Backend Technology Stack
- **Framework:** Spring Boot
- **Database:** MongoDB
- **API:** RESTful (JSON)
- **Port:** 8085

### Frontend Technology Stack
- **Framework:** React + Vite
- **HTTP Client:** Axios
- **UI Library:** Tailwind CSS + Lucide Icons
- **State Management:** React Hooks
- **Real-time:** Polling (15-20 second intervals)

---

## 📱 Components

### Student Portal
**File:** `frontend/src/components/StudentAnalytics.jsx`

**Props:**
- `studentId`: Student's unique identifier (default: 'STU001')
- `onBack`: Callback function to navigate back

**Tabs:**
1. **Overview** - Performance metrics & trends
2. **Skills** - Proficiency tracking
3. **Goals** - Goal management & progress
4. **Reports** - Generated reports

### Faculty Portal
**File:** `frontend/src/components/FacultyAnalytics.jsx`

**Props:**
- `facultyId`: Faculty's unique identifier (default: 'FAC001')
- `onBack`: Callback function to navigate back

**Tabs:**
1. **Dashboard** - Overview statistics
2. **Students** - Individual student analytics
3. **Flagged** - Students needing attention

---

## 🗄️ Database Models

### StudentAnalytics
```javascript
{
  _id: ObjectId,
  studentId: String,
  studentName: String,
  email: String,
  department: String,
  semester: String,
  overallPerformanceScore: Number,        // 0-100
  currentGPA: Number,
  gpaTarget: Number,
  placementReadinessScore: Number,        // 0-100
  activeGoalsCount: Number,
  skillsTrackedCount: Number,
  hoursSpentAcademics: Number,
  hoursSpentSkills: Number,
  hoursSpentPlacements: Number,
  gpaTrend: [{
    week: String,
    gpa: Number,
    date: LocalDateTime
  }],
  performanceTrend: [{
    category: String,
    score: Number,
    date: LocalDateTime
  }],
  placementTrend: [{
    metric: String,
    count: Number,
    date: LocalDateTime
  }],
  lastUpdated: LocalDateTime,
  createdAt: LocalDateTime
}
```

### SkillAnalytics
```javascript
{
  _id: ObjectId,
  studentId: String,
  skillName: String,
  proficiencyPercentage: Number,          // 0-100
  proficiencyLevel: String,               // Beginner/Intermediate/Expert
  endorsementsCount: Number,
  category: String,                       // Technical/Soft Skills/Domain
  lastUpdated: LocalDateTime,
  createdAt: LocalDateTime,
  status: String                          // Active/Inactive
}
```

### Goal
```javascript
{
  _id: ObjectId,
  studentId: String,
  title: String,
  description: String,
  category: String,                       // Academic/Skill/Placement/Personal
  status: String,                         // Active/Completed/Paused/Cancelled
  progressPercentage: Number,             // 0-100
  createdAt: LocalDateTime,
  targetDate: LocalDateTime,
  completedDate: LocalDateTime,
  assignedBy: String,                     // Faculty ID
  milestones: [String],
  completedMilestones: Number,
  priority: String,                       // High/Medium/Low
  feedback: String,
  lastUpdated: LocalDateTime
}
```

### AnalyticsReport
```javascript
{
  _id: ObjectId,
  studentId: String,
  studentName: String,
  reportType: String,                     // Monthly Academic/Skills/Placement
  generatedBy: String,                    // System or Faculty
  generatedAt: LocalDateTime,
  content: String,
  status: String,                         // Draft/Published/Archived
  month: String,
  year: String,
  performanceScore: Number,
  improvementScore: Number,
  recommendations: String,
  fileUrl: String
}
```

### AnalyticsFeedback
```javascript
{
  _id: ObjectId,
  studentId: String,
  studentName: String,
  facultyId: String,
  facultyName: String,
  feedbackType: String,                   // Goal/Performance/Skill/General
  content: String,
  category: String,                       // Academics/Skills/Placements
  sentiment: String,                      // Positive/Neutral/Needs Improvement
  flaggedAsNeedsAttention: Boolean,
  recommendedAction: String,
  createdAt: LocalDateTime,
  updatedAt: LocalDateTime,
  isRead: Boolean
}
```

---

## 🔌 API Endpoints

### Student Analytics
```
GET    /api/analytics/student/{studentId}
PUT    /api/analytics/update/{studentId}
GET    /api/analytics/department/{department}
GET    /api/analytics/semester/{semester}
```

### Skills
```
GET    /api/analytics/skills/student/{studentId}
POST   /api/analytics/skills/add
PUT    /api/analytics/skills/update/{skillId}?proficiency={value}
POST   /api/analytics/skills/{skillId}/endorse
GET    /api/analytics/skills/student/{studentId}/category/{category}
```

### Goals
```
GET    /api/analytics/goals/student/{studentId}
GET    /api/analytics/goals/student/{studentId}/all
POST   /api/analytics/goals/create
PUT    /api/analytics/goals/{goalId}/progress?progress={value}
PUT    /api/analytics/goals/{goalId}/complete
PUT    /api/analytics/goals/{goalId}/feedback?feedback={text}
```

### Reports
```
GET    /api/analytics/reports/student/{studentId}
GET    /api/analytics/reports/student/{studentId}/type/{reportType}
POST   /api/analytics/reports/generate
GET    /api/analytics/reports/student/{studentId}/published
GET    /api/analytics/reports/{reportId}/download
```

### Feedback
```
GET    /api/analytics/feedback/student/{studentId}
GET    /api/analytics/feedback/student/{studentId}/unread
POST   /api/analytics/feedback/add
PUT    /api/analytics/feedback/{feedbackId}/read
GET    /api/analytics/feedback/faculty/{facultyId}
GET    /api/analytics/feedback/flagged
PUT    /api/analytics/feedback/{feedbackId}/flag?recommendedAction={text}
```

---

## 🔐 Security & Access Control

### Student Access
- ✅ View only own analytics
- ✅ Read-only access (no manual data edits)
- ✅ Submit incident reports
- ✅ Receive feedback from faculty
- ❌ Cannot edit goals, skills, or scores

### Faculty Access
- ✅ View assigned students' analytics
- ✅ Add feedback and remarks
- ✅ Set or update goals
- ✅ Flag students for attention
- ✅ View department analytics
- ❌ Cannot modify student personal data

### Implementation
- JWT authentication on all endpoints
- Role-based authorization (STUDENT/FACULTY)
- StudentId verification for student requests
- FacultyId verification for faculty requests

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│           Student Activity                              │
│  (Academics, Placements, Skills, Goals Completion)      │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│        Analytics Engine (Backend Service)               │
│  • Calculate performance scores                         │
│  • Update trends                                        │
│  • Generate insights                                    │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│           MongoDB Database                              │
│  • StudentAnalytics                                     │
│  • SkillAnalytics                                       │
│  • Goals                                                │
│  • Reports                                              │
│  • Feedback                                             │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌──────────────────────────┬──────────────────────────────┐
│                          ↓                               │
│         Student Portal              Faculty Portal      │
│  • View own analytics    │  • View class analytics     │
│  • View goals            │  • Add feedback              │
│  • View reports          │  • Set goals                │
│  • View skills           │  • Flag students            │
└──────────────────────────┴──────────────────────────────┘
```

---

## 🔄 Real-Time Sync

### Current Implementation
- **Polling Interval:** 15-20 seconds for frontend
- **Technology:** HTTP/REST API calls
- **Refresh:** Automatic on component mount

### Example (React Hook)
```javascript
useEffect(() => {
  fetchAllData();
  const interval = setInterval(fetchAllData, 15000); // 15 seconds
  return () => clearInterval(interval);
}, [studentId]);
```

### Future Enhancement (WebSockets)
```javascript
// Socket.IO implementation
const socket = io('http://localhost:8085', {
  auth: { token: jwtToken },
  query: { studentId: studentId }
});

socket.on('analytics:update', (data) => {
  setAnalytics(data);
});

socket.on('feedback:new', (feedback) => {
  setFeedback(prev => [...prev, feedback]);
});
```

---

## 💡 Usage Examples

### Getting Student Analytics
```javascript
import { getStudentAnalytics } from '@/services/analyticsAPI';

const [analytics, setAnalytics] = useState(null);

useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      const response = await getStudentAnalytics('STU001');
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  fetchAnalytics();
}, []);
```

### Adding Feedback (Faculty)
```javascript
import { addFeedback } from '@/services/analyticsAPI';

const handleAddFeedback = async (e) => {
  e.preventDefault();
  try {
    await addFeedback({
      studentId: 'STU001',
      facultyId: 'FAC001',
      feedbackType: 'Performance Feedback',
      content: 'Great improvement in recent assignments...',
      category: 'Academics'
    });
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Creating a Goal
```javascript
import { createGoal } from '@/services/analyticsAPI';

const handleCreateGoal = async () => {
  try {
    await createGoal({
      studentId: 'STU001',
      title: 'Improve Algorithm Skills',
      description: 'Complete LeetCode 50 hard problems',
      category: 'Skill Development',
      priority: 'High',
      targetDate: '2026-03-31T00:00:00'
    });
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 📈 Performance Score Calculation

**Formula:**
```
Performance Score = (GPA * 40 / 10) + (Placement Readiness * 60 / 100)
```

**Components:**
- **GPA (40%):** Current GPA with max 4.0
- **Placement Readiness (60%):** Skills + Interviews + Profile strength

**Range:** 0-100

---

## 🎓 Skill Proficiency Levels

| Level | Range | Badge Color |
|-------|-------|-------------|
| Beginner | 0-39% | Blue |
| Intermediate | 40-69% | Yellow |
| Expert | 70-100% | Green |

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
mvn spring-boot:run
# Server runs on http://localhost:8085
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Client runs on http://localhost:4173
```

### 3. Access Analytics
- **Student:** Dashboard → Analytics (after role selection)
- **Faculty:** Faculty Dashboard → Analytics (after role selection)

---

## 📝 Routes in App.jsx

```javascript
// Student Analytics
if (view === 'student-analytics') {
  return <StudentAnalytics studentId={studentId} onBack={backToDashboard} />;
}

// Faculty Analytics
if (view === 'faculty-analytics') {
  return <FacultyAnalytics facultyId={facultyId} onBack={backToFacultyDashboard} />;
}
```

---

## 🔧 Configuration

### API Base URL
```javascript
const API_BASE_URL = 'http://localhost:8085/api/analytics';
```

### Refresh Intervals
```javascript
// Student Portal: 15 seconds
// Faculty Portal: 20 seconds
```

### Performance Thresholds
```javascript
atRiskStudents = score < 50 || GPA < 2.5
highPerformers = score > 80
```

---

## ✅ Testing Checklist

- [ ] Student can view own analytics
- [ ] GPA trends display correctly
- [ ] Skills proficiency updates
- [ ] Goals progress updates
- [ ] Faculty can view student analytics
- [ ] Faculty can add feedback
- [ ] Feedback appears on student portal
- [ ] Reports generate successfully
- [ ] Flagged students appear in faculty view
- [ ] Real-time sync works (15-20 sec intervals)
- [ ] Mobile responsive design works
- [ ] Performance scores calculate correctly

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Analytics not loading | Check backend is running on 8085 |
| CORS error | Ensure @CrossOrigin on all controllers |
| Data not updating | Check polling interval (15-20 seconds) |
| Modal not closing | Ensure state setter is called |
| GPA trend chart empty | Ensure gpaTrend data exists in database |

---

## 📞 Support

For issues or questions:
1. Check backend logs: `mvn spring-boot:run`
2. Check frontend console: Browser DevTools
3. Verify MongoDB connection
4. Ensure all ports are correct (8085, 4173, 27017)

---

**Version:** 1.0.0  
**Last Updated:** January 5, 2026  
**Status:** ✅ Production Ready
