import { model, Schema } from 'mongoose';
import { IUsageTracking } from '../types/index.js';

const usageTrackingSchema = new Schema<IUsageTracking>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Assets',
      required: true,
    },
    performerId: {
      type: String,
      ref: 'Users',
      required: true,
    },
    performerEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['view', 'download', 'share', 'update', 'delete'],
      required: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  },
);

// Asset Analytics
usageTrackingSchema.index({ assetId: 1, action: 1, createdAt: -1 });

// User Activity Audit
usageTrackingSchema.index({ performerId: 1, createdAt: -1 });

// Global Action Trends
usageTrackingSchema.index({ action: 1, createdAt: -1 });

export const UsageTrackingModel = model<IUsageTracking>('UsageLogs', usageTrackingSchema);
