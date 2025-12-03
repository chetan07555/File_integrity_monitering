# Quick Setup and Installation Guide

## Prerequisites Installation

### 1. Install Node.js
- Download from: https://nodejs.org/
- Choose LTS version
- Verify installation: `node --version`

### 2. Install MongoDB
- Download from: https://www.mongodb.com/try/download/community
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### 3. Install Git (Optional)
- Download from: https://git-scm.com/downloads

## Quick Start (Automated)

### Windows PowerShell:

1. Open PowerShell as Administrator
2. Navigate to project directory:
```powershell
cd "C:\Users\cheta\OneDrive\Desktop\File_integrity_monitering"
```

3. Run setup script:
```powershell
.\setup.ps1
```

4. Start the application:
```powershell
.\start.ps1
```

## Manual Setup

### Backend:

```powershell
cd backend
npm install
copy .env.example .env
notepad .env  # Configure your settings
npm start
```

### Frontend:

```powershell
cd frontend
npm install
npm run dev
```

## First Time Usage

1. **Access the Application**
   - Open browser: http://localhost:5173

2. **Register Admin User**
   - Click "Sign up"
   - Fill in details
   - First user becomes admin

3. **Test File Monitoring**
   - Open: `backend/watched_files/`
   - Create a test file: `echo "test" > test.txt`
   - Watch dashboard update in real-time

4. **Explore Features**
   - View event statistics
   - Use filters to search events
   - Click "View" to see event details
   - Check email for alerts (if configured)

## Configuration Checklist

### Essential Settings (.env):
- [x] `MONGODB_URI` - Your MongoDB connection string
- [x] `JWT_SECRET` - Change to a secure random string
- [x] `WATCH_DIRECTORY` - Path to monitor (default: ./watched_files)

### Optional Settings:
- [ ] Email alerts (if you want notifications)
  - `ENABLE_EMAIL_ALERTS=true`
  - `EMAIL_USER` - Your Gmail address
  - `EMAIL_PASSWORD` - Gmail app password
  - `ALERT_EMAIL_TO` - Recipient email

## Troubleshooting

### "Cannot be loaded because running scripts is disabled"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Port 5000 already in use"
Change `PORT` in backend/.env to another port (e.g., 5001)

### MongoDB Connection Failed
- Ensure MongoDB service is running
- Check connection string in .env
- For Atlas: whitelist your IP address

## Next Steps

1. **Read Full Documentation**: See README.md
2. **Try Test Scenarios**: See TEST_DATA.md
3. **Configure Email Alerts**: Update .env with email settings
4. **Customize Watch Directory**: Change WATCH_DIRECTORY in .env

## Support

- Full documentation: README.md
- Test examples: TEST_DATA.md
- Check logs: backend/logs/combined.log

---

**You're all set! Start monitoring your files! 🚀**
