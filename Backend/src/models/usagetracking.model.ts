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
      type: Schema.Types.ObjectId,
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
    platform: {
      type: String,
      default: 'Web Dashboard',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

// Indexes for the Analytics Service
// These make generating reports (e.g., "Top 10 Downloaded Assets") very fast
usageTrackingSchema.index({ assetId: 1, action: 1 });
usageTrackingSchema.index({ performerEmail: 1 });

export const UsageTrackingModel = model<IUsageTracking>('UsageLogs', usageTrackingSchema);
