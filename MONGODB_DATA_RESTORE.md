# MongoDB Data Restoration Guide 🗄️

## Problem Identified
Your old data is stored in **MongoDB Atlas Cloud**, but there's a **network connectivity issue** preventing access from your machine.

### Error
```
MongoSocketReadException: Prematurely reached end of stream
```

This typically means:
- Firewall/Network policy blocking Atlas connection
- ISP blocking port 27017
- VPN/Proxy issues
- MongoDB Atlas IP whitelist not including your IP

---

## Solution 1: Export Data from Atlas → Import to Local MongoDB ✅ (Recommended)

### Step 1: Install MongoDB Compass (Local GUI Tool)
1. Download from: https://www.mongodb.com/products/compass
2. Install and open
3. Under "New Connection", click "Create Favorite"

### Step 2: Connect to Your Atlas Cluster
In MongoDB Compass:
```
mongodb+srv://sakethreddy11111_db_user:qlLJ2gQo2akSci7T@uniconnect.y84peev.mongodb.net/uniconnect
```

### Step 3: Export Collections as JSON
1. In Compass, right-click each collection (reels, materials, assignments, etc.)
2. Select "Export Collection"
3. Choose "JSON" format
4. Save to `backend/data/exports/`

Collections to export:
- reels
- materials
- assignments
- (and any other collections with data)

### Step 4: Install Local MongoDB
```powershell
# Option A: Download from https://www.mongodb.com/try/download/community
# Option B: Use Chocolatey
choco install mongodb-community

# Option C: Use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 5: Start Local MongoDB
```powershell
# If installed as Windows Service
Start-Service MongoDB

# Or start manually
mongod
```

### Step 6: Import Data to Local MongoDB
In MongoDB Compass:
1. Connect to `mongodb://localhost:27017`
2. Right-click database → "Create Database"
3. Name it: `uniconnect`
4. Right-click collection → "Import Data"
5. Select your exported JSON files
6. Click "Import"

---

## Solution 2: Fix Network Access to Atlas 🌐

### Check Your IP Address
```powershell
(Invoke-WebRequest -Uri "https://checkip.amazonaws.com").Content
```

### Add Your IP to MongoDB Atlas Whitelist
1. Go to: https://cloud.mongodb.com
2. Login
3. Project → Network Access
4. Click "Add IP Address"
5. Paste your IP
6. Click "Confirm"
7. Wait 5 minutes for changes to propagate

---

## Solution 3: Use VPN to Connect to Atlas

If you're behind a corporate firewall:
1. Connect to a VPN
2. Restart backend
3. Should now reach MongoDB Atlas

---

## Solution 4: Create Local MongoDB Backup Script 💾

### Create a PowerShell backup script:
```powershell
# File: backup-mongo-data.ps1

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "E:\backups\mongodb-$timestamp"

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# Export each collection
mongodump --uri "mongodb://localhost:27017/uniconnect" --out $backupDir

Write-Host "✅ Backup created at $backupDir"
```

### Run it:
```powershell
./backup-mongo-data.ps1
```

---

## Current Setup

### Your Backend Configuration
**File**: `backend/src/main/resources/application.properties`

```properties
# Currently using LOCAL MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/uniconnect
```

### Your MongoDB Data Location
- **Atlas** (Unreachable): uniconnect.y84peev.mongodb.net
- **Local** (Empty): localhost:27017
- **Status**: ❌ Not synced

---

## What's Currently Working

✅ Backend on `http://localhost:8085`  
✅ Frontend on `http://localhost:4173`  
✅ API endpoints responding  
❌ Old data from Atlas (network blocked)  
✅ Sample data available  

---

## Quick Fix: Use Sample Data Now

While you restore your old data, the backend has created sample data:

### Access Sample Data
```
http://localhost:8085/api/reels          # 6 sample reels
http://localhost:8085/api/materials      # 4 study materials  
http://localhost:8085/api/assignments    # 5 sample assignments
```

---

## Step-by-Step Recovery (Fastest Method)

### Option A: Use MongoDB Compass GUI (5 minutes)
1. Download MongoDB Compass
2. Connect to your Atlas cluster (using the URI above)
3. For each collection with data:
   - Right-click → Export Collection → JSON
   - Save to a folder
4. Install local MongoDB
5. In Compass, connect to localhost
6. Create `uniconnect` database
7. For each exported JSON:
   - Right-click collection → Import Data
8. Restart backend
9. ✅ Done! Your data is now in local MongoDB

### Option B: Check Atlas IP Whitelist (2 minutes)
1. Go to https://cloud.mongodb.com
2. Login
3. Check "Network Access" → IP Whitelist
4. Is your current IP listed?
   - If NO: Add it
   - If YES: Try VPN or contact your ISP

### Option C: Use MongoDB Command Line
```bash
# Export from Atlas
mongodump --uri "mongodb+srv://sakethreddy11111_db_user:qlLJ2gQo2akSci7T@uniconnect.y84peev.mongodb.net/uniconnect"

# Import to local
mongorestore --uri "mongodb://localhost:27017" dump/
```

---

## Prevention: Sync Strategy

### Recommended: Dual Database Strategy
1. **Local MongoDB** (localhost) - Development
2. **MongoDB Atlas** (Cloud) - Backup/Production

### Keep Them Synced
```properties
# During development
spring.data.mongodb.uri=mongodb://localhost:27017/uniconnect

# Before deployment  
spring.data.mongodb.uri=mongodb+srv://user:pass@cluster.mongodb.net/uniconnect
```

---

## Checking Atlas Credentials

Your MongoDB Atlas connection string:
```
mongodb+srv://sakethreddy11111_db_user:qlLJ2gQo2akSci7T@uniconnect.y84peev.mongodb.net/uniconnect
```

Breaking it down:
- **User**: sakethreddy11111_db_user
- **Password**: qlLJ2gQo2akSci7T (CHANGE THIS - exposed in logs!)
- **Cluster**: uniconnect.y84peev.mongodb.net
- **Database**: uniconnect

### ⚠️ SECURITY WARNING
Your credentials are now exposed in logs and version control. **Change password immediately**:
1. Go to MongoDB Atlas
2. Database Users → sakethreddy11111_db_user
3. Click "Edit Password"
4. Generate new password
5. Update `application.properties`

---

## Troubleshooting

### "Cannot connect to localhost MongoDB"
```powershell
# Check if MongoDB is running
Get-Process mongod

# If not running, start it
Start-Service MongoDB
# OR
mongod
```

### "No data appears in frontend"
1. Check backend logs for MongoDB connection errors
2. Verify MongoDB is running: `mongosh` should connect
3. Check sample data exists: `db.reels.count()`

### "Atlas connection times out"
1. Check your IP in Atlas whitelist
2. Try connecting through VPN
3. Check firewall settings
4. Try alternative: export data first

---

## Next Steps

1. **Immediate** (5 min): Use sample data now
2. **Short-term** (30 min): Restore your old data
3. **Long-term** (Today): Set up data sync strategy

---

**Need Help?**
Check `/api/reels` endpoint - if it returns data, MongoDB is working!

**Last Updated**: January 13, 2026
