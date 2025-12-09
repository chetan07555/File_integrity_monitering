import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import HashService from './HashService.js';
import logger from '../utils/logger.js';

class ProtectionService {
  constructor() {
    this.backupDir = path.resolve(process.env.PROTECTED_BACKUP_DIR || path.join(process.cwd(), 'protected_backups'));
    this.encryptionKey = this.buildKey(process.env.BACKUP_ENCRYPTION_KEY);
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      logger.info(`Created protected backup directory at ${this.backupDir}`);
    }
  }

  buildKey(raw) {
    const fallback = 'dev_backup_key_32bytes_long_placeholder!!';
    const src = raw && raw.length >= 16 ? raw : fallback;
    const buf = Buffer.from(src.padEnd(32, '0')).subarray(0, 32);
    return buf;
  }

  getVersionTag() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  loadMetadata({ metaPath, backupPath }) {
    const resolvedMeta = metaPath
      ? path.resolve(metaPath)
      : path.resolve(`${backupPath}.meta.json`);

    if (!fs.existsSync(resolvedMeta)) {
      throw new Error('Backup metadata file not found');
    }

    const raw = fs.readFileSync(resolvedMeta, 'utf8');
    return JSON.parse(raw);
  }

  async restoreBackup({ backupPath, metaPath, destinationPath }) {
    if (!backupPath && !metaPath) {
      throw new Error('Provide backupPath or metaPath');
    }

    const resolvedBackup = backupPath ? path.resolve(backupPath) : null;
    const metadata = this.loadMetadata({ metaPath, backupPath: resolvedBackup });
    const targetBackupPath = resolvedBackup || path.resolve(metadata.backupPath);

    if (!fs.existsSync(targetBackupPath)) {
      throw new Error('Backup file not found');
    }

    const destPath = destinationPath
      ? path.resolve(destinationPath)
      : path.resolve(metadata.sourcePath);

    // Read encrypted data and auth tag (last 16 bytes)
    const encBuffer = fs.readFileSync(targetBackupPath);
    if (encBuffer.length < 16) {
      throw new Error('Backup file is too small or corrupted');
    }

    const authTag = encBuffer.subarray(encBuffer.length - 16);
    const ciphertext = encBuffer.subarray(0, encBuffer.length - 16);

    const iv = Buffer.from(metadata.iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

    // Ensure destination directory exists
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.writeFileSync(destPath, plaintext);

    logger.info(`Backup restored to ${destPath}`);

    return {
      restoredTo: destPath,
      sourceBackup: targetBackupPath,
      fromMeta: metadata,
      bytes: plaintext.length,
    };
  }

  async protectFile(filePath, options = {}) {
    const resolvedSource = path.resolve(filePath);

    if (!fs.existsSync(resolvedSource)) {
      throw new Error('Source file does not exist');
    }

    if (resolvedSource.startsWith(this.backupDir)) {
      throw new Error('Refusing to back up a file inside the protected backup directory');
    }

    const versionTag = this.getVersionTag();
    const baseName = path.basename(resolvedSource);
    const targetDir = path.join(this.backupDir, path.dirname(path.relative(process.cwd(), resolvedSource)));
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, `${baseName}.${versionTag}.enc`);
    const metaPath = `${targetPath}.meta.json`;

    const { iv, size } = await this.encryptFile(resolvedSource, targetPath);
    const hash = await HashService.calculateFileHash(resolvedSource);

    // Persist metadata for traceability
    const metadata = {
      sourcePath: resolvedSource,
      backupPath: targetPath,
      versionTag,
      createdAt: new Date().toISOString(),
      iv: iv.toString('hex'),
      algorithm: 'aes-256-gcm',
      size,
      hash,
      sourceEventId: options.sourceEventId || null,
    };
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf8');

    // Attempt to lock write permissions (best-effort)
    try {
      fs.chmodSync(resolvedSource, 0o444);
      metadata.locked = true;
    } catch (err) {
      metadata.locked = false;
      logger.warn(`Could not set read-only permissions on ${resolvedSource}: ${err.message}`);
    }

    logger.info(`Protected backup created at ${targetPath}`);
    return metadata;
  }

  encryptFile(source, destination) {
    return new Promise((resolve, reject) => {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

      const input = fs.createReadStream(source);
      const output = fs.createWriteStream(destination);

      let totalBytes = 0;

      input.on('data', (chunk) => {
        totalBytes += chunk.length;
      });

      input.on('error', (err) => reject(err));
      output.on('error', (err) => reject(err));

      output.on('finish', () => {
        const authTag = cipher.getAuthTag();
        // Append authTag to the end of the file for verification during restore (future work)
        fs.appendFileSync(destination, authTag);
        resolve({ iv, size: totalBytes });
      });

      input.pipe(cipher).pipe(output);
    });
  }
}

export default new ProtectionService();
