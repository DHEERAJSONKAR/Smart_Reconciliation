import mongoose, { Document, Schema } from 'mongoose';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RECONCILE = 'RECONCILE',
  REVIEW = 'REVIEW',
}

export interface IAuditLog extends Document {
  entityType: string;
  entityId: mongoose.Types.ObjectId;
  action: AuditAction;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  changedBy: mongoose.Types.ObjectId;
  source: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      trim: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Entity ID is required'],
      index: true,
    },
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: [true, 'Action is required'],
      index: true,
    },
    oldValue: {
      type: Schema.Types.Mixed,
    },
    newValue: {
      type: Schema.Types.Mixed,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Changed by user is required'],
      index: true,
    },
    source: {
      type: String,
      required: [true, 'Source is required'],
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
      immutable: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound indexes
auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ changedBy: 1, timestamp: -1 });

// Prevent any updates or deletes
auditLogSchema.pre('findOneAndUpdate', function (next) {
  next(new Error('Audit logs cannot be updated'));
});

auditLogSchema.pre('updateOne', function (next) {
  next(new Error('Audit logs cannot be updated'));
});

auditLogSchema.pre('updateMany', function (next) {
  next(new Error('Audit logs cannot be updated'));
});

auditLogSchema.pre('findOneAndDelete', function (next) {
  next(new Error('Audit logs cannot be deleted'));
});

auditLogSchema.pre('deleteOne', function (next) {
  next(new Error('Audit logs cannot be deleted'));
});

auditLogSchema.pre('deleteMany', function (next) {
  next(new Error('Audit logs cannot be deleted'));
});

const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
