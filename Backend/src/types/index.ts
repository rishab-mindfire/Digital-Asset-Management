import { Types } from 'mongoose';

//-------------------------------------------------------------------------------------
// User Registration
export interface UserType {
  userID: string;
  userName: string;
  userEmail: string;
  userPassword: string;
  userRole: string;
}

// User Login
export interface IUserLogin {
  userEmail: string;
  userPassword: string;
}

// error parse
export interface ParsedError {
  status: number;
  message: string;
}

//-------------------------------------------------------------------------------------
//user details
//Asset Interface
export interface IAsset extends Document {
  uploadId: string;
  title: string;
  fileType: 'image' | 'video' | 'document' | 'audio';
  // Storage
  localPath: string;
  previewPath?: string;
  // Lifecycle
  status: 'pending' | 'processing' | 'uploaded' | 'expired' | 'archived';
  // Ownership
  ownerID: string;
  ownerEmail: string;
  department?: string;
  // Intelligence
  metadata: {
    size: number;
    extension: string;
    dimensions?: string;
    tags: string[];
    hash: string;
  };
  usageRights: string;
  expiryDate?: Date;
  version: number;
  checksum: string; // To detect duplicates
  versionHistory: [
    {
      versionNumber: number;
      fileId: string; // ID of the file in storage disk
      createdAt: Date;
    },
  ];
  isCompliant: { type: boolean; default: true };
  downloadCount: { type: number; default: 0 };
}

//Collection Interface
export interface ICollection extends Document {
  name: string;
  description?: string;
  assets: Types.ObjectId[];
  createdBy: Types.ObjectId;
  ownerEmail: string;
  isPublic: boolean; //  sharing across teams
}

//usese tracking
export interface IUsageTracking extends Document {
  assetId: Types.ObjectId;
  performerId: string; // (Ref to UsersModel userid)
  performerEmail: string;
  action: 'view' | 'download' | 'share' | 'update' | 'delete';
  platform: string;
  metadata?: Record<string, string[]>;
}

/**
 * Queue payload type
 */
export interface MediaTaskPayload {
  assetId: string;
  filePath: string;
  fileType: string;
}

export interface ChunkUploadBody {
  chunkIndex: string;
  totalChunks: string;
}

export interface FinalizeMergeBody {
  title?: string;
  department?: string;
  collectionId?: string;
  expiryDate?: string;
}

export interface AuthUser {
  userID: string;
  userEmail: string;
}

export interface AuthUser {
  userID: string;
  userEmail: string;
}
