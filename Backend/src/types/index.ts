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
  localPath: string;
  previewPath?: string;
  fileHash: string;
  thumbnailPath?: string;
  // Duplicate Logic
  isDuplicate: boolean;
  originalAssetId?: string;

  status: 'pending' | 'processing' | 'uploaded' | 'archived';
  approval: 'pending' | 'approved';
  ownerID: string;
  owner: string;
  department?: string;

  metadata: {
    size: number;
    extension: string;
    dimensions?: string;
    tags: string[];
    hash: string;
    isDuplicate: boolean;
    originalAssetId?: string;
  };
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  //asset expire
  expiresAt: Date;
  isExpired: { type: boolean; default: false };
}

//Collection Interface
export interface ICollection extends Document {
  name: string;
  description?: string;
  assets: Types.ObjectId[];
  createdBy: Types.ObjectId;
  ownerEmail: string;
  isPublic: boolean;
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

export interface FileMetadata {
  size: number;
  localPath: string;
}

export interface AuthUser {
  userID: string;
  userEmail: string;
}

export interface MockMulterFile {
  buffer: Buffer;
  originalname: string;
}
