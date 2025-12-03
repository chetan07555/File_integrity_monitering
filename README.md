# Advanced File Integrity Monitoring (FIM) System

A comprehensive MERN stack application for real-time file integrity monitoring with advanced features including SHA-256 hashing, diff analysis, email alerts, and live updates via Socket.io.

## 🚀 Features

### Backend Features
- **Real-time File Monitoring**: Uses `chokidar` to watch a configurable directory for file changes
- **Event Detection**: Detects CREATE, MODIFY, and DELETE events
- **Integrity Checks**: SHA-256 hash computation for file verification
- **Metadata Capture**: Records file size, timestamps, permissions, and extensions
- **Diff Analysis**: Line-by-line comparison for text files with detailed change summaries
- **MongoDB Storage**: Complete audit trail with indexed fields for fast queries
- **JWT Authentication**: Secure user authentication and authorization
- **Socket.io Integration**: Real-time event broadcasting to connected clients
- **Email Alerts**: Automated email notifications via Nodemailer for critical changes
- **Professional Architecture**: Organized with controllers, services, routes, and middleware

### Frontend Features
- **Real-time Dashboard**: Auto-updating interface without manual refresh
- **Event Table**: Comprehensive view of all file events with sorting and pagination
- **Advanced Filters**: Search by filename, event type, user, status, and date range
- **Event Details Modal**: Full event history and metadata viewer
- **Color-coded Status**: Visual indicators (Green=OK, Red=Modified, Yellow=Deleted, Blue=Created)
- **Statistics Cards**: Real-time overview of system activity
- **Responsive Design**: Built with TailwindCSS for all screen sizes
- **Modern UI/UX**: Clean, professional interface with React Icons

## 📁 Project Structure

```
File_integrity_monitering/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── fileEventController.js # File event operations
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── errorHandler.js      # Global error handler
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── FileEvent.js         # File event schema
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   └── fileEventRoutes.js   # Event endpoints
│   ├── services/
│   │   ├── HashService.js       # SHA-256 hashing
│   │   ├── MetadataService.js   # File metadata extraction
│   │   ├── DiffService.js       # File comparison
│   │   ├── EmailService.js      # Email notifications
│   │   └── WatcherService.js    # File monitoring
│   ├── utils/
│   │   └── logger.js            # Winston logger
│   ├── logs/                    # Application logs
│   ├── watched_files/           # Directory to monitor (auto-created)
│   ├── .env.example             # Environment variables template
│   ├── .gitignore
│   ├── package.json
│   └── server.js                # Application entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx        # Authentication UI
│   │   │   ├── Header.jsx       # Application header
│   │   │   ├── Filters.jsx      # Search and filter UI
│   │   │   ├── EventTable.jsx   # Event list display
│   │   │   └── EventModal.jsx   # Event details modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/
│   │   │   └── Dashboard.jsx    # Main dashboard
│   │   ├── services/
│   │   │   ├── api.js           # Axios API client
│   │   │   └── socket.js        # Socket.io client
│   │   ├── App.jsx              # Root component
│   │   ├── main.jsx             # Application entry
│   │   └── index.css            # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Step 1: Clone/Navigate to Project
```bash
cd File_integrity_monitering
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from template
copy .env.example .env

# Edit .env file with your configuration
notepad .env
```

**Configure .env file:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/file_integrity_monitoring
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
WATCH_DIRECTORY=./watched_files
ENABLE_EMAIL_ALERTS=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=FIM System <your-email@gmail.com>
ALERT_EMAIL_TO=admin@example.com
CORS_ORIGIN=http://localhost:5173
```

**For Gmail Email Alerts:**
1. Go to Google Account settings
2. Enable 2-Step Verification
3. Generate an "App Password"
4. Use the app password in `EMAIL_PASSWORD`

### Step 3: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

### Step 4: Start MongoDB

```bash
# Start MongoDB service (Windows)
net start MongoDB

# Or if using MongoDB Compass, ensure the connection is active
```

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Or for development with auto-reload:
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 👤 User Setup

### Creating an Admin User

1. Start the backend server
2. Use the following request to register an admin user:

**Using PowerShell:**
```powershell
$body = @{
    username = "admin"
    email = "admin@fim.local"
    password = "admin123"
    role = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"email\":\"admin@fim.local\",\"password\":\"admin123\",\"role\":\"admin\"}"
```

### Default Test Users

After registration, you can login with:
- **Email**: admin@fim.local
- **Password**: admin123

## 🧪 Testing the System

### 1. Login to the System
- Navigate to http://localhost:5173
- Login with your credentials
- You'll see the dashboard

### 2. Create Test Files

The system monitors the `backend/watched_files` directory. Create test files:

```powershell
# Navigate to watched directory
cd backend/watched_files

# Create a new file
echo "Hello World" > test1.txt

# Modify the file
echo "Hello World Modified" > test1.txt

# Create more test files
echo "const x = 1;" > script.js
echo "# Test Markdown" > readme.md

# Delete a file
rm test1.txt
```

### 3. Observe Real-time Updates
- Watch the dashboard update automatically
- Check the statistics cards
- View detailed event information
- Filter events by type, status, or date

## 📊 API Endpoints

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
GET /api/auth/me - Get current user (Protected)
```

### File Events
```
GET /api/events - Get all events (Protected)
  Query params: fileName, eventType, user, status, startDate, endDate, page, limit
GET /api/events/stats - Get event statistics (Protected)
GET /api/events/:id - Get event by ID (Protected)
GET /api/events/history/:filePath - Get file history (Protected)
DELETE /api/events/:id - Delete event (Admin only)
```

## 🔧 Configuration Options

### Watch Directory
Change the monitored directory in `.env`:
```env
WATCH_DIRECTORY=C:/path/to/your/directory
```

### Email Alerts
Enable/disable email alerts:
```env
ENABLE_EMAIL_ALERTS=true  # or false
```

### JWT Settings
Adjust token expiration:
```env
JWT_EXPIRE=7d  # 7 days, or 24h, 30d, etc.
```

## 📧 Email Alert Format

When critical changes occur, emails include:
- File name and path
- Event type (CREATE/MODIFY/DELETE)
- User who made the change
- Timestamp
- File metadata (size, permissions)
- Hash values (old and new)
- Detailed line-by-line diff summary
- Color-coded HTML formatting

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Role-based Access**: Admin and user roles
- **Hash Verification**: SHA-256 integrity checks
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Comprehensive error management
- **CORS Protection**: Configurable origins

## 📈 Performance Optimizations

- **MongoDB Indexes**: Fast queries on frequently searched fields
- **Socket.io**: Efficient real-time communication
- **File Caching**: Reduces redundant hash calculations
- **Pagination**: Limited result sets for large datasets
- **Lazy Loading**: Efficient component rendering

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: Could not connect to MongoDB
Solution: Ensure MongoDB is running and MONGODB_URI is correct
```

### Port Already in Use
```
Error: Port 5000 is already in use
Solution: Change PORT in .env or stop the conflicting process
```

### Email Not Sending
```
Issue: Emails not being received
Solutions:
1. Check EMAIL_USER and EMAIL_PASSWORD
2. Enable less secure apps or use app password
3. Verify SMTP settings
4. Check spam folder
```

### Files Not Being Detected
```
Issue: File changes not appearing
Solutions:
1. Verify WATCH_DIRECTORY path exists
2. Check file watcher is initialized
3. Review backend logs
```

## 🔍 Monitoring & Logs

Application logs are stored in `backend/logs/`:
- `combined.log` - All logs
- `error.log` - Error logs only

View logs in real-time:
```bash
# Windows PowerShell
Get-Content backend/logs/combined.log -Wait

# Or open in text editor
notepad backend/logs/combined.log
```

## 🚀 Production Deployment

### Environment Variables
Update for production:
```env
NODE_ENV=production
JWT_SECRET=use_a_very_strong_random_secret_here
MONGODB_URI=your_production_mongodb_uri
CORS_ORIGIN=https://your-production-domain.com
```

### Build Frontend
```bash
cd frontend
npm run build
```

### PM2 Process Manager (Recommended)
```bash
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name fim-backend

# Monitor
pm2 monit
```

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review application logs

## 🎯 Future Enhancements

- [ ] Multi-directory monitoring
- [ ] Advanced reporting and analytics
- [ ] File restoration capabilities
- [ ] Webhook integrations
- [ ] Mobile application
- [ ] Advanced threat detection
- [ ] Backup integration
- [ ] Audit log export

---

**Built with ❤️ using MERN Stack**
