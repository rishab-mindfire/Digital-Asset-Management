import { model, Schema } from 'mongoose';
import { IAsset } from '../types/index.js';

const assetSchema = new Schema<IAsset>(
  {
    title: { type: String, required: true },
    fileType: {
      type: String,
      enum: ['image', 'video', 'document', 'audio'],
      required: true,
    },
    localPath: { type: String, required: true },
    previewPath: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'approved', 'expired', 'archived'],
      default: 'pending',
    },
    ownerID: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    department: { type: String },
    metadata: {
      size: { type: Number },
      extension: { type: String },
      dimensions: { type: String },
      tags: [{ type: String }],
      hash: { type: String },
    },
    usageRights: { type: String },
    expiryDate: { type: Date },
    version: { type: Number, default: 1 },
  },
  { timestamps: true },
);

// Search Index
assetSchema.index({ title: 'text', 'metadata.tags': 'text' });

export const AssetModel = model<IAsset>('Assets', assetSchema);
