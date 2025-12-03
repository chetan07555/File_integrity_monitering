import mongoose from 'mongoose';

const fileEventSchema = new mongoose.Schema(
  {
    filePath: {
      type: String,
      required: [true, 'File path is required'],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: ['CREATE', 'MODIFY', 'DELETE'],
    },
    user: {
      type: String,
      default: 'System',
    },
    oldHash: {
      type: String,
      default: null,
    },
    newHash: {
      type: String,
      default: null,
    },
    metadata: {
      size: {
        type: Number,
        default: 0,
      },
      createdAt: {
        type: Date,
      },
      modifiedAt: {
        type: Date,
      },
      permissions: {
        type: String,
      },
      extension: {
        type: String,
      },
    },
    diffSummary: {
      linesAdded: {
        type: Number,
        default: 0,
      },
      linesRemoved: {
        type: Number,
        default: 0,
      },
      linesChanged: {
        type: Number,
        default: 0,
      },
      details: {
        type: String,
        default: '',
      },
    },
    status: {
      type: String,
      enum: ['OK', 'MODIFIED', 'DELETED', 'CREATED'],
      default: 'OK',
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast queries
fileEventSchema.index({ filePath: 1, createdAt: -1 });
fileEventSchema.index({ eventType: 1, createdAt: -1 });
fileEventSchema.index({ user: 1, createdAt: -1 });
fileEventSchema.index({ status: 1 });
fileEventSchema.index({ createdAt: -1 });

// Compound index for complex queries
fileEventSchema.index({ filePath: 1, eventType: 1, createdAt: -1 });

const FileEvent = mongoose.model('FileEvent', fileEventSchema);

export default FileEvent;
