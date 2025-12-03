import fs from 'fs/promises';
import logger from '../utils/logger.js';

class DiffService {
  /**
   * Calculate diff between two text files
   * @param {string} oldContent - Original file content
   * @param {string} newContent - New file content
   * @returns {Object} - Diff summary
   */
  calculateDiff(oldContent, newContent) {
    try {
      // Split content into lines
      const oldLines = oldContent ? oldContent.split('\n') : [];
      const newLines = newContent ? newContent.split('\n') : [];

      // Simple line-by-line diff
      const diff = this.lineByLineDiff(oldLines, newLines);

      const summary = {
        linesAdded: diff.added,
        linesRemoved: diff.removed,
        linesChanged: diff.changed,
        details: this.formatDiffDetails(diff.details),
      };

      logger.debug(`Diff calculated: +${diff.added}, -${diff.removed}, ~${diff.changed}`);
      return summary;
    } catch (error) {
      logger.error(`Error calculating diff: ${error.message}`);
      return {
        linesAdded: 0,
        linesRemoved: 0,
        linesChanged: 0,
        details: 'Error calculating diff',
      };
    }
  }

  /**
   * Perform line-by-line diff using Myers diff algorithm (simplified)
   * @param {Array} oldLines - Old file lines
   * @param {Array} newLines - New file lines
   * @returns {Object} - Diff result
   */
  lineByLineDiff(oldLines, newLines) {
    const details = [];
    let added = 0;
    let removed = 0;
    let changed = 0;

    // Build a line-to-line mapping using LCS
    const lcs = this.getLCS(oldLines, newLines);
    
    let oldIndex = 0;
    let newIndex = 0;
    let lcsIndex = 0;

    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      // If we've matched all LCS elements, remaining are adds or removes
      if (lcsIndex >= lcs.length) {
        // Remaining old lines are removed
        while (oldIndex < oldLines.length) {
          removed++;
          details.push({ 
            type: 'removed', 
            line: oldIndex + 1, 
            content: oldLines[oldIndex] 
          });
          oldIndex++;
        }
        // Remaining new lines are added
        while (newIndex < newLines.length) {
          added++;
          details.push({ 
            type: 'added', 
            line: newIndex + 1, 
            content: newLines[newIndex] 
          });
          newIndex++;
        }
        break;
      }

      const lcsLine = lcs[lcsIndex];

      // Process removed lines (lines in old but not in LCS yet)
      while (oldIndex < oldLines.length && oldLines[oldIndex] !== lcsLine) {
        removed++;
        details.push({ 
          type: 'removed', 
          line: oldIndex + 1, 
          content: oldLines[oldIndex] 
        });
        oldIndex++;
      }

      // Process added lines (lines in new but not in LCS yet)
      while (newIndex < newLines.length && newLines[newIndex] !== lcsLine) {
        added++;
        details.push({ 
          type: 'added', 
          line: newIndex + 1, 
          content: newLines[newIndex] 
        });
        newIndex++;
      }

      // Move past the common line
      if (oldIndex < oldLines.length && newIndex < newLines.length) {
        oldIndex++;
        newIndex++;
        lcsIndex++;
      }
    }

    return { added, removed, changed, details: details.slice(0, 50) }; // Limit to 50 changes
  }

  /**
   * Get Longest Common Subsequence of lines
   * @param {Array} oldLines - Old file lines
   * @param {Array} newLines - New file lines
   * @returns {Array} - LCS array
   */
  getLCS(oldLines, newLines) {
    const m = oldLines.length;
    const n = newLines.length;
    
    // Create DP table
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    // Fill DP table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (oldLines[i - 1] === newLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    // Backtrack to get LCS
    const lcs = [];
    let i = m;
    let j = n;
    
    while (i > 0 && j > 0) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        lcs.unshift(oldLines[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    
    return lcs;
  }

  /**
   * Format diff details for display
   * @param {Array} details - Diff details array
   * @returns {string} - Formatted string
   */
  formatDiffDetails(details) {
    if (!details || details.length === 0) {
      return 'No changes detected';
    }

    const formatted = details.slice(0, 20).map((detail) => {
      switch (detail.type) {
        case 'added':
          return `+ Line ${detail.line}: ${this.truncate(detail.content, 100)}`;
        case 'removed':
          return `- Line ${detail.line}: ${this.truncate(detail.content, 100)}`;
        case 'changed':
          return `~ Line ${detail.line}: "${this.truncate(detail.old, 50)}" → "${this.truncate(detail.new, 50)}"`;
        default:
          return '';
      }
    });

    if (details.length > 20) {
      formatted.push(`... and ${details.length - 20} more changes`);
    }

    return formatted.join('\n');
  }

  /**
   * Truncate string to max length
   * @param {string} str - String to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} - Truncated string
   */
  truncate(str, maxLength) {
    if (!str) return '';
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }

  /**
   * Check if file is text file (for diff calculation)
   * @param {string} filePath - Path to file
   * @returns {boolean} - True if text file
   */
  isTextFile(filePath) {
    const textExtensions = [
      '.txt', '.js', '.jsx', '.ts', '.tsx', '.json', '.xml', '.html',
      '.css', '.scss', '.md', '.py', '.java', '.c', '.cpp', '.h',
      '.yml', '.yaml', '.env', '.log', '.sql', '.sh', '.bat'
    ];

    return textExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
  }

  /**
   * Read file content as text
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} - File content
   */
  async readFileContent(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      logger.error(`Error reading file ${filePath}: ${error.message}`);
      return '';
    }
  }
}

export default new DiffService();
