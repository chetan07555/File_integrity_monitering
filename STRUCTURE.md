# Project Structure Overview

## Complete File Tree

```
File_integrity_monitering/
│
├── 📁 backend/
│   ├── 📁 config/
│   │   └── database.js                 # MongoDB connection configuration
│   │
│   ├── 📁 controllers/
│   │   ├── authController.js           # User authentication (register, login, getMe)
│   │   └── fileEventController.js      # File event operations (get, filter, stats, delete)
│   │
│   ├── 📁 middleware/
│   │   ├── auth.js                     # JWT authentication & authorization
│   │   └── errorHandler.js             # Global error handling
│   │
│   ├── 📁 models/
│   │   ├── User.js                     # User schema (username, email, password, role)
│   │   └── FileEvent.js                # File event schema (complete audit log)
│   │
│   ├── 📁 routes/
│   │   ├── authRoutes.js               # Authentication endpoints
│   │   └── fileEventRoutes.js          # File event API endpoints
│   │
│   ├── 📁 services/
│   │   ├── HashService.js              # SHA-256 hash calculation
│   │   ├── MetadataService.js          # File metadata extraction
│   │   ├── DiffService.js              # Line-by-line file comparison
│   │   ├── EmailService.js             # Email notification system
│   │   └── WatcherService.js           # Chokidar file monitoring
│   │
│   ├── 📁 utils/
│   │   └── logger.js                   # Winston logger configuration
│   │
│   ├── 📁 logs/                        # Application logs (auto-generated)
│   │   ├── combined.log
│   │   └── error.log
│   │
│   ├── 📁 watched_files/               # Directory being monitored (auto-created)
│   │
│   ├── .env.example                    # Environment variables template
│   ├── .gitignore                      # Git ignore rules
│   ├── package.json                    # Backend dependencies
│   └── server.js                       # Main application entry point
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── Login.jsx               # Authentication UI
│   │   │   ├── Header.jsx              # Application header with user info
│   │   │   ├── Filters.jsx             # Search and filter interface
│   │   │   ├── EventTable.jsx          # File events table display
│   │   │   └── EventModal.jsx          # Detailed event information modal
│   │   │
│   │   ├── 📁 context/
│   │   │   └── AuthContext.jsx         # Global authentication state
│   │   │
│   │   ├── 📁 pages/
│   │   │   └── Dashboard.jsx           # Main dashboard with real-time updates
│   │   │
│   │   ├── 📁 services/
│   │   │   ├── api.js                  # Axios HTTP client
│   │   │   └── socket.js               # Socket.io client
│   │   │
│   │   ├── App.jsx                     # Root component
│   │   ├── main.jsx                    # Application entry
│   │   └── index.css                   # Global styles & Tailwind
│   │
│   ├── index.html                      # HTML template
│   ├── package.json                    # Frontend dependencies
│   ├── vite.config.js                  # Vite configuration
│   ├── tailwind.config.js              # Tailwind CSS configuration
│   ├── postcss.config.js               # PostCSS configuration
│   └── .gitignore                      # Git ignore rules
│
├── 📄 README.md                        # Complete documentation
├── 📄 QUICKSTART.md                    # Quick installation guide
├── 📄 TEST_DATA.md                     # Test scenarios and examples
├── 📄 STRUCTURE.md                     # This file
├── 🔧 setup.ps1                        # Automated setup script
└── 🔧 start.ps1                        # Application start script
```

## Key Components Explained

### Backend Architecture

#### 1. **Services Layer** (Business Logic)
- `HashService`: Calculates SHA-256 hashes for file integrity verification
- `MetadataService`: Extracts file size, timestamps, permissions
- `DiffService`: Compares file content line-by-line, generates change summaries
- `EmailService`: Sends HTML formatted email alerts with change details
- `WatcherService`: Monitors directory using chokidar, orchestrates other services

#### 2. **Controllers** (Request Handlers)
- `authController`: Handles user registration, login, token generation
- `fileEventController`: Manages event queries, filtering, statistics, deletion

#### 3. **Models** (Data Schemas)
- `User`: Stores user credentials, roles, with bcrypt password hashing
- `FileEvent`: Complete audit log with metadata, hashes, diffs, timestamps

#### 4. **Middleware**
- `auth`: JWT token verification and role-based access control
- `errorHandler`: Centralized error handling and response formatting

#### 5. **Routes**
- `/api/auth/*`: Authentication endpoints
- `/api/events/*`: File event endpoints with filtering and pagination

### Frontend Architecture

#### 1. **Components**
- `Login`: Dual-purpose login/register form
- `Header`: Navigation bar with user info and logout
- `Filters`: Advanced search with multiple criteria
- `EventTable`: Paginated, sortable event list
- `EventModal`: Full event details with metadata and diffs

#### 2. **Context**
- `AuthContext`: Global authentication state management

#### 3. **Services**
- `api.js`: Axios instance with interceptors for JWT tokens
- `socket.js`: Socket.io client for real-time updates

#### 4. **Pages**
- `Dashboard`: Main interface with statistics, filters, and real-time table

### Data Flow

```
File Change → WatcherService detects
    ↓
Calculate Hash (HashService)
    ↓
Extract Metadata (MetadataService)
    ↓
Generate Diff (DiffService - for text files)
    ↓
Save to MongoDB (FileEvent model)
    ↓
Emit Socket.io event → Frontend updates
    ↓
Send Email Alert (EmailService - if critical)
```

### Real-time Updates Flow

```
Backend File Change
    ↓
WatcherService creates FileEvent
    ↓
Socket.io broadcasts to all connected clients
    ↓
Frontend socket listener receives event
    ↓
React state updates
    ↓
Dashboard re-renders with new event
```

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **File Monitoring**: Chokidar
- **Real-time**: Socket.io
- **Email**: Nodemailer
- **Logging**: Winston

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Icons**: React Icons

## Environment Variables

### Backend (.env)
```env
PORT=5000                          # Server port
NODE_ENV=development               # Environment mode
MONGODB_URI=mongodb://...          # Database connection
JWT_SECRET=secret_key              # Token signing key
JWT_EXPIRE=7d                      # Token expiration
WATCH_DIRECTORY=./watched_files   # Directory to monitor
ENABLE_EMAIL_ALERTS=true          # Email toggle
EMAIL_HOST=smtp.gmail.com         # SMTP server
EMAIL_PORT=587                     # SMTP port
EMAIL_USER=email@gmail.com        # Email account
EMAIL_PASSWORD=app_password       # Email password
EMAIL_FROM=FIM System <email>     # From address
ALERT_EMAIL_TO=admin@email.com    # Alert recipient
CORS_ORIGIN=http://localhost:5173 # Frontend URL
```

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current user (Protected)

### File Events
- `GET /api/events` - Get all events with filters (Protected)
- `GET /api/events/stats` - Get event statistics (Protected)
- `GET /api/events/:id` - Get specific event (Protected)
- `GET /api/events/history/:filePath` - Get file history (Protected)
- `DELETE /api/events/:id` - Delete event (Admin only)

## Database Indexes

### User Collection
- `email` (unique)
- `username` (unique)

### FileEvent Collection
- `filePath + createdAt` (compound)
- `eventType + createdAt` (compound)
- `user + createdAt` (compound)
- `status` (single)
- `createdAt` (single, descending)

## Security Features

1. **Password Security**: Bcrypt hashing with salt
2. **JWT Tokens**: Secure authentication
3. **Role-based Access**: Admin and user roles
4. **File Integrity**: SHA-256 hashing
5. **Input Validation**: Mongoose schema validation
6. **Error Handling**: No sensitive data leakage
7. **CORS Protection**: Configured origins only

## Performance Optimizations

1. **Database Indexes**: Fast queries on common filters
2. **File Caching**: Reduces redundant hash calculations
3. **Pagination**: Limited result sets
4. **Socket.io**: Efficient bidirectional communication
5. **Lazy Loading**: Components load as needed

## Monitoring & Debugging

### Log Files
- `backend/logs/combined.log` - All application logs
- `backend/logs/error.log` - Error logs only

### Real-time Monitoring
- Socket.io connection status
- Live event count in dashboard
- Statistics cards update automatically

### Debug Mode
Enable detailed logging by setting in `.env`:
```env
NODE_ENV=development
```

## Extension Points

### Adding New File Types
Edit `DiffService.js`:
```javascript
isTextFile(filePath) {
  const textExtensions = [..., '.newext'];
  // Add your extension
}
```

### Custom Email Templates
Edit `EmailService.js`:
```javascript
generateEmailHTML(event) {
  // Customize HTML template
}
```

### Additional Event Metadata
Edit `FileEvent.js` model:
```javascript
metadata: {
  // Add new fields
  customField: String,
}
```

### New API Endpoints
1. Create controller function
2. Add route in routes file
3. Update API documentation

## Best Practices Implemented

1. **Separation of Concerns**: Services, controllers, routes separated
2. **Error Handling**: Try-catch blocks and error middleware
3. **Logging**: Comprehensive Winston logging
4. **Environment Config**: All settings in .env
5. **Code Organization**: Logical folder structure
6. **Comments**: Clear documentation in code
7. **Validation**: Input validation at model and controller level
8. **Security**: Authentication, authorization, input sanitization

## Testing Recommendations

1. **Unit Tests**: Test individual services
2. **Integration Tests**: Test API endpoints
3. **E2E Tests**: Test full user workflows
4. **Load Tests**: Test with many simultaneous file changes
5. **Security Tests**: Test authentication and authorization

## Maintenance

### Regular Tasks
- Review and clean logs
- Monitor MongoDB size
- Update dependencies
- Review security advisories
- Backup database

### Scaling Considerations
- Add Redis for caching
- Implement queue for email sending
- Use PM2 for process management
- Add load balancer for multiple instances
- Optimize MongoDB queries

---

**This structure provides a solid foundation for a production-ready File Integrity Monitoring system.**
