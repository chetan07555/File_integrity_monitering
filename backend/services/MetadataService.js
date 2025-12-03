import fs from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import logger from '../utils/logger.js';

class MetadataService {
  /**
   * Get file metadata
   * @param {string} filePath - Path to the file
   * @returns {Promise<Object>} - File metadata
   */
  async getFileMetadata(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const extension = path.extname(filePath);
      
      // Get file permissions
      const permissions = await this.getFilePermissions(filePath);

      const metadata = {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        permissions: permissions,
        extension: extension || 'none',
      };

      logger.debug(`Metadata retrieved for ${filePath}`);
      return metadata;
    } catch (error) {
      logger.error(`Error getting metadata for ${filePath}: ${error.message}`);
      return {
        size: 0,
        createdAt: new Date(),
        modifiedAt: new Date(),
        permissions: 'unknown',
        extension: 'unknown',
      };
    }
  }

  /**
   * Get file permissions in readable format
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} - Permissions string
   */
  async getFilePermissions(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const mode = stats.mode;
      
      // Convert to octal string
      const octalMode = (mode & parseInt('777', 8)).toString(8);
      
      // Check specific permissions
      const permissions = {
        readable: await this.checkFileAccess(filePath, constants.R_OK),
        writable: await this.checkFileAccess(filePath, constants.W_OK),
        executable: await this.checkFileAccess(filePath, constants.X_OK),
      };

      return `${octalMode} (R:${permissions.readable}, W:${permissions.writable}, X:${permissions.executable})`;
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Check file access permissions
   * @param {string} filePath - Path to the file
   * @param {number} mode - Access mode constant
   * @returns {Promise<boolean>} - True if access is granted
   */
  async checkFileAccess(filePath, mode) {
    try {
      await fs.access(filePath, mode);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format file size in human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export default new MetadataService();
