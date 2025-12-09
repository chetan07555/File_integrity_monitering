import FileEvent from '../models/FileEvent.js';
import logger from '../utils/logger.js';
import fs from 'fs';

/**
 * @desc    Get all file events with filtering and pagination
 * @route   GET /api/events
 * @access  Private
 */
export const getFileEvents = async (req, res) => {
  try {
    const {
      fileName,
      eventType,
      user,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build query
    const query = {};

    if (fileName) {
      query.fileName = { $regex: fileName, $options: 'i' };
    }

    if (eventType) {
      query.eventType = eventType;
    }

    if (user) {
      query.user = { $regex: user, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute query
    const events = await FileEvent.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const total = await FileEvent.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total: total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: events,
    });
  } catch (error) {
    logger.error(`Get file events error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching file events',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single file event by ID
 * @route   GET /api/events/:id
 * @access  Private
 */
export const getFileEventById = async (req, res) => {
  try {
    const event = await FileEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'File event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    logger.error(`Get file event by ID error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching file event',
      error: error.message,
    });
  }
};

/**
 * @desc    Get file event history for a specific file
 * @route   GET /api/events/history/:filePath
 * @access  Private
 */
export const getFileHistory = async (req, res) => {
  try {
    const { filePath } = req.params;
    const decodedPath = decodeURIComponent(filePath);

    const events = await FileEvent.find({ filePath: decodedPath })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    logger.error(`Get file history error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching file history',
      error: error.message,
    });
  }
};

/**
 * @desc    Get event statistics
 * @route   GET /api/events/stats
 * @access  Private
 */
export const getEventStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));

    // Get counts by event type
    const eventTypeCounts = await FileEvent.aggregate([
      { $match: { createdAt: { $gte: dateLimit } } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
    ]);

    // Get counts by status
    const statusCounts = await FileEvent.aggregate([
      { $match: { createdAt: { $gte: dateLimit } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Get counts by severity
    const severityCounts = await FileEvent.aggregate([
      { $match: { createdAt: { $gte: dateLimit } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    // Get total events
    const totalEvents = await FileEvent.countDocuments({
      createdAt: { $gte: dateLimit },
    });

    // Get recent events
    const recentEvents = await FileEvent.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        eventTypeCounts,
        statusCounts,
        severityCounts,
        recentEvents,
      },
    });
  } catch (error) {
    logger.error(`Get event stats error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete file event by ID
 * @route   DELETE /api/events/:id
 * @access  Private (Admin only)
 */
export const deleteFileEvent = async (req, res) => {
  try {
    const event = await FileEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'File event not found',
      });
    }

    await event.deleteOne();

    logger.info(`File event deleted: ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: 'File event deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete file event error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error deleting file event',
      error: error.message,
    });
  }
};

/**
 * @desc    Restore file to previous state
 * @route   POST /api/events/:id/restore
 * @access  Private
 */
export const restoreFile = async (req, res) => {
  try {
    const event = await FileEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'File event not found',
      });
    }

    // Only MODIFY events can be restored
    if (event.eventType !== 'MODIFY') {
      return res.status(400).json({
        success: false,
        message: 'Only modified files can be restored',
      });
    }

    // Check if file exists
    if (!fs.existsSync(event.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on disk',
      });
    }

    // Find the previous event for this file (before this modification)
    const previousEvents = await FileEvent.find({
      filePath: event.filePath,
      createdAt: { $lt: event.createdAt },
    })
      .sort({ createdAt: -1 })
      .limit(1);

    if (previousEvents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No previous version found to restore',
      });
    }

    const previousEvent = previousEvents[0];

    // Try to get previous content from WatcherService oldContentCache
    const watcherService = (await import('../services/WatcherService.js')).default;
    let previousContent = null;

    if (watcherService && watcherService.oldContentCache.has(event.filePath)) {
      previousContent = watcherService.oldContentCache.get(event.filePath);
    }

    // If not in cache, we can't restore
    if (!previousContent) {
      return res.status(400).json({
        success: false,
        message: 'Previous file content not available in cache. Cannot restore. The file may have been modified before the monitoring started.',
      });
    }

    // Write previous content back to file
    fs.writeFileSync(event.filePath, previousContent, 'utf8');

    logger.info(`File restored: ${event.filePath} by user ${req.user?.email || 'system'}`);

    res.status(200).json({
      success: true,
      message: 'File restored successfully',
      data: {
        filePath: event.filePath,
        restoredFrom: previousEvent.createdAt,
      },
    });
  } catch (error) {
    logger.error(`Restore file error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error restoring file',
      error: error.message,
    });
  }
};
