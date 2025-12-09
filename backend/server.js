import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import fileEventRoutes from './routes/fileEventRoutes.js';
import protectionRoutes from './routes/protectionRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import WatcherService from './services/WatcherService.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
connectDB();

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  // Send welcome message
  socket.emit('message', {
    type: 'info',
    content: 'Connected to File Integrity Monitoring System',
  });
});

// Initialize File Watcher Service
WatcherService.initialize(io);

// API Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'File Integrity Monitoring API',
    version: '1.0.0',
    watchDirectory: WatcherService.getWatchDirectory(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', fileEventRoutes);
app.use('/api/protect', protectionRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info(`Watching directory: ${WatcherService.getWatchDirectory()}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await WatcherService.stop();
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;
