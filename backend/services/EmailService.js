import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    try {
      if (process.env.ENABLE_EMAIL_ALERTS !== 'true') {
        logger.info('Email alerts are disabled');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      logger.info('Email transporter initialized successfully');
    } catch (error) {
      logger.error(`Error initializing email transporter: ${error.message}`);
    }
  }

  /**
   * Send file change alert email
   * @param {Object} event - File event object
   * @returns {Promise<boolean>} - Success status
   */
  async sendFileChangeAlert(event) {
    try {
      if (!this.transporter || process.env.ENABLE_EMAIL_ALERTS !== 'true') {
        logger.debug('Email alerts disabled, skipping email send');
        return false;
      }

      const subject = `[FIM Alert] ${event.eventType} - ${event.fileName}`;
      const htmlContent = this.generateEmailHTML(event);
      const textContent = this.generateEmailText(event);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: process.env.ALERT_EMAIL_TO,
        subject: subject,
        text: textContent,
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Alert email sent for ${event.fileName}`);
      return true;
    } catch (error) {
      logger.error(`Error sending email alert: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate HTML email content
   * @param {Object} event - File event object
   * @returns {string} - HTML content
   */
  generateEmailHTML(event) {
    const statusColor = this.getStatusColor(event.eventType);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${statusColor}; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { color: #000; }
          .diff-box { background-color: #fff; border: 1px solid #ddd; padding: 10px; margin-top: 10px; font-family: monospace; white-space: pre-wrap; }
          .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>File Integrity Monitoring Alert</h2>
            <p>${event.eventType} Event Detected</p>
          </div>
          
          <div class="content">
            <div class="field">
              <span class="label">File Name:</span>
              <span class="value">${event.fileName}</span>
            </div>
            
            <div class="field">
              <span class="label">File Path:</span>
              <span class="value">${event.filePath}</span>
            </div>
            
            <div class="field">
              <span class="label">Event Type:</span>
              <span class="value">${event.eventType}</span>
            </div>
            
            <div class="field">
              <span class="label">Changed By:</span>
              <span class="value">${event.user || 'System'}</span>
            </div>
            
            <div class="field">
              <span class="label">Timestamp:</span>
              <span class="value">${new Date(event.timestamp || Date.now()).toLocaleString()}</span>
            </div>
            
            <div class="field">
              <span class="label">Status:</span>
              <span class="value">${event.status || 'UNKNOWN'}</span>
            </div>

            ${event.metadata ? `
              <div class="field">
                <span class="label">File Size:</span>
                <span class="value">${this.formatBytes(event.metadata.size)}</span>
              </div>
            ` : ''}

            ${event.oldHash && event.newHash ? `
              <div class="field">
                <span class="label">Old Hash:</span>
                <span class="value">${event.oldHash.substring(0, 16)}...</span>
              </div>
              
              <div class="field">
                <span class="label">New Hash:</span>
                <span class="value">${event.newHash.substring(0, 16)}...</span>
              </div>
            ` : ''}

            ${event.diffSummary && event.diffSummary.details ? `
              <div class="field">
                <span class="label">Changes Summary:</span>
                <div>Lines Added: ${event.diffSummary.linesAdded}</div>
                <div>Lines Removed: ${event.diffSummary.linesRemoved}</div>
                <div>Lines Changed: ${event.diffSummary.linesChanged}</div>
                <div class="diff-box">${event.diffSummary.details}</div>
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>This is an automated alert from the File Integrity Monitoring System</p>
            <p>Please do not reply to this email</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text email content
   * @param {Object} event - File event object
   * @returns {string} - Plain text content
   */
  generateEmailText(event) {
    let text = `
FILE INTEGRITY MONITORING ALERT
================================

Event Type: ${event.eventType}
File Name: ${event.fileName}
File Path: ${event.filePath}
Changed By: ${event.user || 'System'}
Timestamp: ${new Date(event.timestamp || Date.now()).toLocaleString()}
Status: ${event.status || 'UNKNOWN'}
`;

    if (event.metadata) {
      text += `File Size: ${this.formatBytes(event.metadata.size)}\n`;
    }

    if (event.oldHash && event.newHash) {
      text += `\nOld Hash: ${event.oldHash}\n`;
      text += `New Hash: ${event.newHash}\n`;
    }

    if (event.diffSummary && event.diffSummary.details) {
      text += `\nChanges Summary:\n`;
      text += `Lines Added: ${event.diffSummary.linesAdded}\n`;
      text += `Lines Removed: ${event.diffSummary.linesRemoved}\n`;
      text += `Lines Changed: ${event.diffSummary.linesChanged}\n\n`;
      text += `Details:\n${event.diffSummary.details}\n`;
    }

    text += `\n---\nThis is an automated alert from the File Integrity Monitoring System`;
    
    return text;
  }

  /**
   * Get status color for email styling
   * @param {string} eventType - Event type
   * @returns {string} - Color hex code
   */
  getStatusColor(eventType) {
    const colors = {
      CREATE: '#10b981', // Green
      MODIFY: '#ef4444', // Red
      DELETE: '#f59e0b', // Yellow/Orange
    };
    return colors[eventType] || '#6b7280';
  }

  /**
   * Format bytes to human-readable format
   * @param {number} bytes - Bytes
   * @returns {string} - Formatted string
   */
  formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export default new EmailService();
