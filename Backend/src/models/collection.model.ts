import { model, Schema } from 'mongoose';
import { ICollection } from '../types/index.js';

const collectionSchema = new Schema<ICollection>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    // Array of ObjectIds linking to the Assets collection
    assets: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Assets',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    ownerEmail: {
      type: String,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Indexing for lookups by owner name or email
collectionSchema.index({ name: 1, ownerEmail: 1 });

export const CollectionModel = model<ICollection>('Collections', collectionSchema);
