# Reels and Feed Module

Complete implementation of the Reels and Feed functionality for UniConnect platform.

## Features

### Backend Features
- **Create Reels**: Upload and share video reels with title, description, and hashtags
- **Browse Reels**: View reels with filtering by category and sorting options
- **Like System**: Like/unlike reels with persistent storage
- **Save Reels**: Bookmark reels for later viewing
- **Comments**: Add and view comments on reels
- **Search**: Full-text search across reel titles, descriptions, and hashtags
- **View Tracking**: Track views for each reel
- **Category Support**: Organize reels by categories (Tutorial, Event, Hackathon, Sports, Performance, Project)

### Frontend Features
- **Responsive Grid Layout**: Display reels in a responsive grid (3 columns on desktop, 2 on tablet, 1 on mobile)
- **Search and Filter**: Real-time search and category filtering
- **Sort Options**: Sort by trending (likes), recent (date), or popular (views)
- **Engagement Buttons**: Like, comment, share, and save functionality
- **Creator Info**: Display creator profile with verification badge
- **Trending Badge**: Show trending reels (1000+ likes)
- **Comments Preview**: Show top comments with ability to view all
- **Loading States**: Proper loading indicators while fetching data
- **Error Handling**: Graceful error handling with fallback to mock data

## API Endpoints

### Base URL
```
http://localhost:8085/api/reels
```

### Endpoints

#### Get All Reels
```
GET /api/reels
Query Parameters:
  - category: string (optional) - Filter by category
  - sortBy: string (default: "recent") - Sort by: recent, likes, views
  - X-Student-Id: string (optional header) - Current user ID
```

#### Get Single Reel
```
GET /api/reels/{reelId}
Headers:
  - X-Student-Id: string (optional)
```

#### Create Reel
```
POST /api/reels/create
Headers:
  - X-Student-Id: string (required)
  - Content-Type: application/json
Body:
{
  "title": "string",
  "description": "string",
  "videoUrl": "string",
  "thumbnailUrl": "string",
  "category": "string",
  "hashtags": ["string"]
}
```

#### Like Reel
```
POST /api/reels/{reelId}/like
Headers:
  - X-Student-Id: string (required)
```

#### Unlike Reel
```
POST /api/reels/{reelId}/unlike
Headers:
  - X-Student-Id: string (required)
```

#### Save Reel
```
POST /api/reels/{reelId}/save
Headers:
  - X-Student-Id: string (required)
```

#### Unsave Reel
```
POST /api/reels/{reelId}/unsave
Headers:
  - X-Student-Id: string (required)
```

#### Add Comment
```
POST /api/reels/{reelId}/comment
Headers:
  - X-Student-Id: string (required)
  - Content-Type: application/json
Body:
{
  "text": "string"
}
```

#### Search Reels
```
GET /api/reels/search?query={searchQuery}
Headers:
  - X-Student-Id: string (optional)
```

#### Get My Reels
```
GET /api/reels/my-reels
Headers:
  - X-Student-Id: string (required)
```

#### Delete Reel
```
DELETE /api/reels/{reelId}
Headers:
  - X-Student-Id: string (required)
```

## Database Schema

### Reel Collection
```json
{
  "_id": "ObjectId",
  "studentId": "string",
  "studentName": "string",
  "department": "string",
  "avatar": "string",
  "title": "string",
  "description": "string",
  "videoUrl": "string",
  "thumbnailUrl": "string",
  "category": "string",
  "createdAt": "Instant",
  "updatedAt": "Instant",
  "views": "int",
  "likes": "int",
  "comments": "int",
  "saves": "int",
  "verified": "boolean",
  "safe": "boolean",
  "hashtags": ["string"],
  "commentList": [
    {
      "id": "string",
      "studentId": "string",
      "studentName": "string",
      "avatar": "string",
      "text": "string",
      "createdAt": "Instant",
      "likes": "int"
    }
  ],
  "likedByStudents": ["string"],
  "savedByStudents": ["string"]
}
```

## DTOs

### CreateReelRequest
```java
record CreateReelRequest(
    String title,
    String description,
    String videoUrl,
    String thumbnailUrl,
    String category,
    List<String> hashtags
)
```

### ReelResponse
```java
record ReelResponse(
    String id,
    String studentId,
    String studentName,
    String department,
    String avatar,
    String title,
    String description,
    String videoUrl,
    String thumbnailUrl,
    String category,
    Instant createdAt,
    int views,
    int likes,
    int comments,
    int saves,
    boolean verified,
    boolean safe,
    List<String> hashtags,
    List<ReelCommentResponse> commentList,
    boolean isLiked,
    boolean isSaved
)
```

### AddCommentRequest
```java
record AddCommentRequest(
    String text
)
```

## Frontend Usage

### Import Component
```javascript
import ReelsAndFeed from './components/ReelsAndFeed';
```

### Use in App
```javascript
<ReelsAndFeed 
  onBack={() => navigate('/')}
  studentId={currentStudentId}
/>
```

### Props
- `onBack`: Function - Callback when user clicks back button
- `studentId`: String - Current logged-in student ID (required for like, save, comment)

## Services

### ReelService
Handles all reel business logic:
- `createReel()` - Create a new reel
- `getReel()` - Get single reel with view count increment
- `getAllReels()` - Get all reels with filtering and sorting
- `searchReels()` - Search reels by title
- `getStudentReels()` - Get reels by specific student
- `likeReel()` - Like a reel
- `unlikeReel()` - Unlike a reel
- `saveReel()` - Save a reel
- `unsaveReel()` - Unsave a reel
- `addComment()` - Add comment to reel
- `deleteReel()` - Delete a reel (only by creator)

## Categories Supported
- Tutorial
- Event
- Hackathon
- Sports
- Performance
- Project

## Implementation Notes

1. **Authentication**: Uses X-Student-Id header for user identification
2. **Permissions**: Only reel creator can delete their own reels
3. **Real-time Updates**: Like/unlike immediately updates UI
4. **View Tracking**: Views increment when reel is accessed
5. **Hashtags**: Support for multiple hashtags per reel
6. **Comments**: Nested comments with student info and timestamps
7. **Engagement Stats**: Automatic like/save count updates

## Testing

Sample API Request (Create Reel):
```bash
curl -X POST http://localhost:8085/api/reels/create \
  -H "X-Student-Id: student123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Reel",
    "description": "Check out my project!",
    "videoUrl": "https://example.com/video.mp4",
    "thumbnailUrl": "https://example.com/thumb.jpg",
    "category": "Project",
    "hashtags": ["#cool", "#project"]
  }'
```

Sample Response:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "studentId": "student123",
  "studentName": "John Doe",
  "department": "CSE",
  "title": "My First Reel",
  "description": "Check out my project!",
  "category": "Project",
  "views": 0,
  "likes": 0,
  "comments": 0,
  "saves": 0,
  "hashtags": ["#cool", "#project"],
  "isLiked": false,
  "isSaved": false
}
```
