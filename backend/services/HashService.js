import crypto from 'crypto';
import fs from 'fs/promises';
import logger from '../utils/logger.js';

class HashService {
  /**
   * Calculate SHA-256 hash of a file
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} - SHA-256 hash
   */
  async calculateFileHash(filePath) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const hashSum = crypto.createHash('sha256');
      hashSum.update(fileBuffer);
      const hash = hashSum.digest('hex');
      
      logger.debug(`Hash calculated for ${filePath}: ${hash}`);
      return hash;
    } catch (error) {
      logger.error(`Error calculating hash for ${filePath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Compare two hashes
   * @param {string} hash1 - First hash
   * @param {string} hash2 - Second hash
   * @returns {boolean} - True if hashes match
   */
  compareHashes(hash1, hash2) {
    return hash1 === hash2;
  }

  /**
   * Calculate hash for string content
   * @param {string} content - String content
   * @returns {string} - SHA-256 hash
   */
  calculateStringHash(content) {
    const hashSum = crypto.createHash('sha256');
    hashSum.update(content);
    return hashSum.digest('hex');
  }
}

export default new HashService();
