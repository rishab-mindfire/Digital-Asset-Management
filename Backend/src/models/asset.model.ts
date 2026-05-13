import { model, Schema } from 'mongoose';
import { IAsset } from '../types/index.js';

const assetSchema = new Schema<IAsset>(
  {
    uploadId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    //file types
    fileType: {
      type: String,
      enum: ['image', 'video', 'document', 'audio'],
      required: true,
    },
    localPath: { type: String, required: false },
    previewPath: { type: String },
    fileHash: {
      type: String,
      required: true,
      index: true,
    },
    //duplicate tracking
    isDuplicate: { type: Boolean, default: false },
    originalAssetId: { type: Schema.Types.ObjectId, ref: 'Assets' },
    thumbnailPath: { type: String },
    //file upload status
    status: {
      type: String,
      enum: ['pending', 'processing', 'uploaded', 'archived'],
      default: 'pending',
    },
    approval: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'pending',
    },
    ownerID: { type: String, required: true },
    owner: { type: String, required: true },
    department: { type: String },
    //file mata data and duplicate
    metadata: {
      size: { type: Number },
      extension: { type: String },
      dimensions: { type: String },
      tags: [{ type: String }],
      hash: { type: String },
      isDuplicate: { type: Boolean, default: false },
      originalAssetId: { type: Schema.Types.ObjectId, ref: 'Assets' },
    },
    expiresAt: { type: Date, index: true },
    isExpired: { type: Boolean, default: false },
    downloadCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  },
);

// Lookup for file name and department
assetSchema.index({ title: 1, createdAt: -1, department: 1 });

// Search Index lookup
assetSchema.index({ title: 'text', 'metadata.tags': 'text' });

export const AssetModel = model<IAsset>('Assets', assetSchema);
