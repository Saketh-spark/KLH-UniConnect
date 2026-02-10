# Backend Setup & Running Guide 🚀

## ✅ Current Status
Backend is **RUNNING** on `localhost:8085`

### What Just Happened
1. Fixed MongoDB connection errors by adding error handling
2. Changed to local MongoDB (localhost:27017) for development
3. Backend now gracefully handles MongoDB unavailability
4. Sample data is seeding successfully

---

## 🔧 Prerequisites

### Required Software
- **Java JDK 21+** (Currently using Java 24.0.2)
- **Maven 3.8+** (for building)
- **MongoDB** (local or Atlas)
- **Node.js 18+** (for frontend)

### Check Installation
```powershell
java -version
mvn -version
npm -version
```

---

## 📋 Configuration Files

### Backend Configuration
File: `backend/src/main/resources/application.properties`

**Current Setup** (Local Development):
```properties
# Using local MongoDB on default port 27017
spring.data.mongodb.uri=mongodb://localhost:27017/uniconnect
```

**To Use MongoDB Atlas** (Production):
```properties
# Uncomment this line and update with your credentials
spring.data.mongodb.uri=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/uniconnect?appName=UniConnect&retryWrites=true&w=majority
```

---

## 🚀 Running the Backend

### Option 1: Run JAR Directly (Recommended for Development)
```powershell
cd backend
java -jar target/backend-0.1.0.jar
```

Expected Output:
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/

 :: Spring Boot ::                (v3.4.0)
...
Tomcat started on port 8085 (http) with context path '/'
✓ Created 6 sample reels
✓ Sample materials seeded successfully!
✓ Sample assignments seeded successfully!
```

### Option 2: Build from Source
```powershell
cd backend
mvn clean package -DskipTests
java -jar target/backend-0.1.0.jar
```

### Option 3: Run with Maven (Slower)
```powershell
cd backend
mvn spring-boot:run
```

---

## ✅ Verify Backend is Running

### Using Browser
```
http://localhost:8085/api/reels
```
Should return a JSON array with reels data.

### Using PowerShell
```powershell
Invoke-WebRequest -Uri "http://localhost:8085/api/reels" -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Using curl
```bash
curl http://localhost:8085/api/reels
```

---

## 🗄️ MongoDB Setup

### Option A: Use Local MongoDB
1. **Install MongoDB Community**
   - Download from https://www.mongodb.com/try/download/community
   - Run installer
   - Select "Install as Windows Service"

2. **Start MongoDB**
   ```powershell
   # Start service (if installed as service)
   Start-Service MongoDB
   
   # Or start mongod manually
   mongod
   ```

3. **Verify Connection**
   ```powershell
   mongo
   # Should show MongoDB shell
   ```

### Option B: Use MongoDB Atlas Cloud
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb+srv://user:password@cluster.mongodb.net/uniconnect
   ```

### Option C: Docker MongoDB
```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## 🎯 Available API Endpoints

### Health Check
- `GET` http://localhost:8085/actuator/health

### Reels
- `GET` http://localhost:8085/api/reels - Get all reels
- `POST` http://localhost:8085/api/reels/upload - Upload new reel

### Placements (New Module)
- `GET` http://localhost:8085/api/placements/jobs - Get all jobs
- `GET` http://localhost:8085/api/placements/applications - Get applications
- `GET` http://localhost:8085/api/placements/analytics - Get student analytics

### Other
- `GET` http://localhost:8085/api/materials - Get materials
- `GET` http://localhost:8085/api/assignments - Get assignments

---

## 🐛 Troubleshooting

### Issue: "Connection refused" for MongoDB
**Solution:**
- Ensure MongoDB is running
- Check if port 27017 is available
- Verify `spring.data.mongodb.uri` is correct

### Issue: Port 8085 already in use
**Solution:**
```powershell
# Find process using port 8085
netstat -ano | findstr :8085

# Kill the process
taskkill /PID <PID> /F

# Or change port in application.properties
server.port=8086
```

### Issue: JAR file not found
**Solution:**
```powershell
cd backend
mvn clean package -DskipTests
```

### Issue: OutOfMemory error
**Solution:**
```powershell
java -Xmx1024m -jar target/backend-0.1.0.jar
```

---

## 📦 Sample Data

When backend starts, it automatically creates:
- **6 Sample Reels** (various categories)
- **4 Sample Materials** (DBMS, DSA, OS, Microprocessors)
- **5 Sample Assignments** (with deadlines)
- **Placement Module** (ready for use with mock data)

---

## 🔐 Security Notes

### Development Password
On startup, Spring generates a password:
```
Using generated security password: 8e704fc3-55f1-4789-aa1a-b81956022190
```
Use this for API testing with authentication.

### Production Security
Before deploying to production:
1. Configure real database credentials
2. Set up proper authentication/authorization
3. Use HTTPS instead of HTTP
4. Configure CORS properly
5. Add JWT token validation

---

## 📊 Monitoring

### View Logs
- All logs are printed to console
- No separate log file by default

### Enable Debug Logging
Add to `application.properties`:
```properties
logging.level.com.uniconnect=DEBUG
logging.level.org.springframework=DEBUG
```

---

## 🔄 Restarting Backend

```powershell
# Stop current process (Ctrl+C in terminal)
# Then restart:
java -jar target/backend-0.1.0.jar
```

---

## 📝 Next Steps

1. ✅ **Backend Running** - You're here!
2. ⏭️ **Start Frontend** - See [FRONTEND_SETUP.md](FRONTEND_SETUP.md)
3. Test API endpoints
4. Connect to real MongoDB if needed
5. Deploy to Azure/production

---

## 📞 Support

For issues:
1. Check backend logs for error messages
2. Verify MongoDB is running
3. Confirm ports 8085 and 27017 are available
4. Check application.properties configuration

**Last Updated:** January 13, 2026
