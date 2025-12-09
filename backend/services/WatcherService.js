import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import HashService from './HashService.js';
import MetadataService from './MetadataService.js';
import DiffService from './DiffService.js';

import FileEvent from '../models/FileEvent.js';
import logger from '../utils/logger.js';

class WatcherService {
  constructor() {
    this.watcher = null;
    this.io = null;
    this.fileCache = new Map(); // Cache to store current file states { hash, content }
    this.oldContentCache = new Map(); // Cache to store previous file content for restoration
    this.recentlyCreated = new Map(); // Track recently created files to avoid duplicate events
    this.backupDirectory = path.resolve(process.env.PROTECTED_BACKUP_DIR || path.join(process.cwd(), 'protected_backups'));
  }

  /**
   * Initialize the file watcher
   * @param {Object} io - Socket.io instance
   */
  initialize(io) {
    this.io = io;
    
    // Read watch directory from environment variable at initialization time
    this.watchDirectory = process.env.WATCH_DIRECTORY || './watched_files';
    
    logger.info(`Attempting to watch directory: ${this.watchDirectory}`);
    
    // Ensure watch directory exists
    try {
      if (!fs.existsSync(this.watchDirectory)) {
        logger.warn(`Watch directory does not exist, creating: ${this.watchDirectory}`);
        fs.mkdirSync(this.watchDirectory, { recursive: true });
        logger.info(`Created watch directory: ${this.watchDirectory}`);
      } else {
        logger.info(`Watch directory exists: ${this.watchDirectory}`);
      }
    } catch (error) {
      logger.error(`Error accessing watch directory: ${error.message}`);
      logger.error(`Please check the WATCH_DIRECTORY path in .env file`);
      logger.info(`Falling back to default directory: ./watched_files`);
      this.watchDirectory = './watched_files';
      if (!fs.existsSync(this.watchDirectory)) {
        fs.mkdirSync(this.watchDirectory, { recursive: true });
      }
    }

    // Initialize chokidar watcher
    this.watcher = chokidar.watch(this.watchDirectory, {
      ignored: (filePath) => {
        const isDot = /(^|[/\\])\../.test(filePath);
        const isBackup = filePath.startsWith(this.backupDirectory);
        return isDot || isBackup;
      },
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
    });

    this.setupEventListeners();
    logger.info(`File watcher initialized for directory: ${this.watchDirectory}`);
  }

  /**
   * Setup event listeners for file changes
   */
  setupEventListeners() {
    // File added
    this.watcher.on('add', async (filePath) => {
      await this.handleFileAdd(filePath);
    });

    // File changed
    this.watcher.on('change', async (filePath) => {
      await this.handleFileChange(filePath);
    });

    // File deleted
    this.watcher.on('unlink', async (filePath) => {
      await this.handleFileDelete(filePath);
    });

    // Error handling
    this.watcher.on('error', (error) => {
      logger.error(`Watcher error: ${error.message}`);
    });

    // Ready event
    this.watcher.on('ready', async () => {
      logger.info('File watcher is ready and monitoring for changes');
      // Populate cache with existing files
      await this.populateCache();
    });
  }

  /**
   * Populate cache with existing files
   */
  async populateCache() {
    try {
      logger.info('Populating cache with existing files...');
      const files = fs.readdirSync(this.watchDirectory, { withFileTypes: true });
      
      for (const file of files) {
        if (file.isFile() && !file.name.startsWith('.')) {
          const filePath = path.join(this.watchDirectory, file.name);
          try {
            const hash = await HashService.calculateFileHash(filePath);
            
            if (DiffService.isTextFile(filePath)) {
              const content = await DiffService.readFileContent(filePath);
              this.fileCache.set(filePath, { hash, content });
            } else {
              this.fileCache.set(filePath, { hash, content: null });
            }
            
            logger.debug(`Cached existing file: ${file.name}`);
          } catch (error) {
            logger.error(`Error caching file ${file.name}: ${error.message}`);
          }
        }
      }
      
      logger.info(`Cache populated with ${this.fileCache.size} files`);
    } catch (error) {
      logger.error(`Error populating cache: ${error.message}`);
    }
  }

  /**
   * Handle file addition
   * @param {string} filePath - Path to the file
   */
  async handleFileAdd(filePath) {
    try {
      logger.info(`File added: ${filePath}`);

      const fileName = path.basename(filePath);
      const hash = await HashService.calculateFileHash(filePath);
      const metadata = await MetadataService.getFileMetadata(filePath);

      // Store in cache - include content for text files
      if (DiffService.isTextFile(filePath)) {
        const content = await DiffService.readFileContent(filePath);
        this.fileCache.set(filePath, { hash, content });
      } else {
        this.fileCache.set(filePath, { hash, content: null });
      }

      // Mark as recently created to prevent duplicate MODIFY event
      this.recentlyCreated.set(filePath, Date.now());
      setTimeout(() => {
        this.recentlyCreated.delete(filePath);
      }, 3000); // Clear after 3 seconds

      // Create file event
      const fileEvent = await FileEvent.create({
        filePath: filePath,
        fileName: fileName,
        eventType: 'CREATE',
        user: process.env.USERNAME || 'System',
        oldHash: null,
        newHash: hash,
        metadata: metadata,
        status: 'CREATED',
        severity: 'MEDIUM',
        diffSummary: {
          linesAdded: 0,
          linesRemoved: 0,
          linesChanged: 0,
          details: 'New file created',
        },
      });

      // Emit real-time update
      if (this.io) {
        this.io.emit('fileEvent', fileEvent);
      }

      // Send email alert
      const emailSent = await EmailService.sendFileChangeAlert(fileEvent);
      if (emailSent) {
        fileEvent.emailSent = true;
        await fileEvent.save();
      }

      logger.info(`File event created for: ${fileName}`);
    } catch (error) {
      logger.error(`Error handling file add: ${error.message}`);
    }
  }

  /**
   * Handle file modification
   * @param {string} filePath - Path to the file
   */
  async handleFileChange(filePath) {
    try {
      // Skip if file was just created
      const createdTime = this.recentlyCreated.get(filePath);
      if (createdTime && (Date.now() - createdTime < 3000)) {
        logger.info(`Skipping change event for recently created file: ${filePath}`);
        return;
      }

      logger.info(`File changed: ${filePath}`);

      const fileName = path.basename(filePath);
      const newHash = await HashService.calculateFileHash(filePath);
      const metadata = await MetadataService.getFileMetadata(filePath);

      // Get previous state from cache
      const cachedData = this.fileCache.get(filePath) || {};
      const oldHash = cachedData.hash || null;

      // Calculate diff for text files
      let diffSummary = {
        linesAdded: 0,
        linesRemoved: 0,
        linesChanged: 0,
        details: 'Binary file or diff not available',
      };

      if (DiffService.isTextFile(filePath)) {
        const oldContent = cachedData.content !== undefined ? cachedData.content : '';
        const newContent = await DiffService.readFileContent(filePath);
        
        logger.debug(`Old content length: ${oldContent.length}, New content length: ${newContent.length}`);
        
        diffSummary = DiffService.calculateDiff(oldContent, newContent);
        
        // Store old content in restoration cache before updating
        if (oldContent) {
          this.oldContentCache.set(filePath, oldContent);
        }
        
        // Update cache with new content
        this.fileCache.set(filePath, { hash: newHash, content: newContent });
      } else {
        this.fileCache.set(filePath, { hash: newHash, content: null });
      }

      // Determine severity
      const severity = this.calculateSeverity(diffSummary);

      // Create file event
      const fileEvent = await FileEvent.create({
        filePath: filePath,
        fileName: fileName,
        eventType: 'MODIFY',
        user: process.env.USERNAME || 'System',
        oldHash: oldHash,
        newHash: newHash,
        metadata: metadata,
        status: 'MODIFIED',
        severity: severity,
        diffSummary: diffSummary,
      });

      // Emit real-time update
      if (this.io) {
        this.io.emit('fileEvent', fileEvent);
      }

      // Send email alert for critical changes
      if (severity === 'HIGH' || severity === 'CRITICAL') {
        const emailSent = await EmailService.sendFileChangeAlert(fileEvent);
        if (emailSent) {
          fileEvent.emailSent = true;
          await fileEvent.save();
        }
      }

      logger.info(`File event created for modification: ${fileName}`);
    } catch (error) {
      logger.error(`Error handling file change: ${error.message}`);
    }
  }

  /**
   * Handle file deletion
   * @param {string} filePath - Path to the file
   */
  async handleFileDelete(filePath) {
    try {
      logger.info(`File deleted: ${filePath}`);

      const fileName = path.basename(filePath);
      
      // Get cached data
      const cachedData = this.fileCache.get(filePath) || {};
      const oldHash = cachedData.hash || null;

      // Create file event
      const fileEvent = await FileEvent.create({
        filePath: filePath,
        fileName: fileName,
        eventType: 'DELETE',
        user: process.env.USERNAME || 'System',
        oldHash: oldHash,
        newHash: null,
        metadata: {
          size: 0,
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: 'N/A',
          extension: path.extname(filePath),
        },
        status: 'DELETED',
        severity: 'HIGH',
        diffSummary: {
          linesAdded: 0,
          linesRemoved: 0,
          linesChanged: 0,
          details: 'File deleted',
        },
      });

      // Remove from cache
      this.fileCache.delete(filePath);

      // Emit real-time update
      if (this.io) {
        this.io.emit('fileEvent', fileEvent);
      }

      // Send email alert
      const emailSent = await EmailService.sendFileChangeAlert(fileEvent);
      if (emailSent) {
        fileEvent.emailSent = true;
        await fileEvent.save();
      }

      logger.info(`File event created for deletion: ${fileName}`);
    } catch (error) {
      logger.error(`Error handling file delete: ${error.message}`);
    }
  }

  /**
   * Calculate severity based on changes
   * @param {Object} diffSummary - Diff summary
   * @returns {string} - Severity level
   */
  calculateSeverity(diffSummary) {
    const totalChanges = diffSummary.linesAdded + diffSummary.linesRemoved + diffSummary.linesChanged;

    if (totalChanges > 100) return 'CRITICAL';
    if (totalChanges > 50) return 'HIGH';
    if (totalChanges > 10) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Stop the watcher
   */
  async stop() {
    if (this.watcher) {
      await this.watcher.close();
      logger.info('File watcher stopped');
    }
  }

  /**
   * Get watched directory
   * @returns {string} - Watch directory path
   */
  getWatchDirectory() {
    return this.watchDirectory;
  }
}

export default new WatcherService();
