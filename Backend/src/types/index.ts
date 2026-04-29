import { Types } from 'mongoose';

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

//user details
//-------------------------------------------------------------------------------------
//Asset Interface
export interface IAsset extends Document {
  title: string;
  fileType: 'image' | 'video' | 'document' | 'audio';
  // Storage
  localPath: string; // Path to the high-res original in /storage/raw
  previewPath?: string; // Path to the thumbnail in /storage/previews (set by Worker)
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
      fileId: string; // ID of the file in storage
      createdAt: Date;
    },
  ];
  isCompliant: { type: boolean; default: true }; // For Flagging
  downloadCount: { type: number; default: 0 }; // For Analytics
}

//Collection Interface
export interface ICollection extends Document {
  name: string;
  description?: string;
  // Relationship: Array of Asset IDs
  assets: Types.ObjectId[];
  // Ownership
  createdBy: Types.ObjectId; // Reference to UsersModel
  ownerEmail: string;
  isPublic: boolean; // For sharing across teams
}

//usese tracking
export interface IUsageTracking extends Document {
  assetId: Types.ObjectId; // Which asset was accessed
  performerId: Types.ObjectId; // Who accessed it (Ref to UsersModel)
  performerEmail: string;
  action: 'view' | 'download' | 'share' | 'update' | 'delete';
  platform: string; // e.g., 'Web Dashboard', 'Mobile App', 'External API'
  metadata?: Record<string, string[]>; // Extra context (e.g., IP address, browser)
}
