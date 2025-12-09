import FileEvent from '../models/FileEvent.js';
import ProtectionService from '../services/ProtectionService.js';

export const protectFile = async (req, res) => {
  try {
    const { filePath, eventId } = req.body || {};

    if (!filePath && !eventId) {
      return res.status(400).json({
        success: false,
        message: 'Provide either filePath or eventId',
      });
    }

    let targetPath = filePath;

    if (!targetPath && eventId) {
      const event = await FileEvent.findById(eventId);
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      targetPath = event.filePath;
    }

    const metadata = await ProtectionService.protectFile(targetPath, {
      sourceEventId: eventId || null,
    });

    res.status(200).json({ success: true, data: metadata });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const restoreBackup = async (req, res) => {
  try {
    const { backupPath, metaPath, destinationPath } = req.body || {};

    if (!backupPath && !metaPath) {
      return res.status(400).json({
        success: false,
        message: 'Provide backupPath or metaPath',
      });
    }

    const result = await ProtectionService.restoreBackup({
      backupPath,
      metaPath,
      destinationPath,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
