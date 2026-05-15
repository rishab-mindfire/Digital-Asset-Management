// AUTH TYPES
export type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
};
// Auth context shape used across the app.
export type AuthContextType = {
  state: AuthState;

  /**
   * Logs in the user by storing token
   * @param token - JWT token received from backend
   */
  login: (token: string) => void;

  // Logs out the user and clears session
  logout: () => void;
};

// LOGIN ERROR TYPES
// Represents validation errors for login form.
export interface LoginErrors {
  userEmail?: string;
  userPassword?: string;
  general?: string;
}

// Login form state.
export interface LoginType {
  userEmail: string;
  userPassword: string;
  loading: boolean;
  errors: LoginErrors;
}
// Actions supported by login reducer.
export type LoginAction =
  | { type: 'SET_FIELD'; field: keyof LoginType; value: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: LoginErrors }
  | { type: 'RESET' };

// Login API response.
export type LoginResponse = {
  token: string;
};

// Signin ERROR TYPES
// Represents validation errors for signin form.
export interface SignInErrors {
  userName?: string;
  userRole?: string;
  userEmail?: string;
  userPassword?: string;
  general?: string;
}
//signUp
type UserRole = 'admin' | 'manager' | 'public';
export interface SignupType {
  userName: string;
  userEmail: string;
  userPassword: string;
  userRole?: UserRole;
  loading: boolean;
  errors: SignInErrors;
}

// Actions supported by signup reducer.
export type SigninAction =
  | { type: 'SET_FIELD'; field: keyof SignupType; value: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: SignInErrors }
  | { type: 'RESET' };

//file upload model
export interface UploadOptions {
  chunkSize?: number;
}

export interface MergePayload {
  uploadId: string;
  filename: string;
  totalChunks: number;
}

export interface UploadResponse {
  message: string;
  data?: unknown;
}

export interface ApiErrorResponse {
  message: string;
}

//assets
export interface AssetListType {
  _id: string;
  title: string;
  fileType: string;
  approval: string;
  owner: string;
  updatedAt: string;
  __v?: number;
  status?: string;
  createdAt?: string;
}

export interface FormattedAsset {
  id: string;
  name: string;
  type: string;
  Approval: string;
  owner: string;
  updated: string;
}
export interface AssetApiResponse {
  assets: AssetListType[];
  total: number;
  page: number;
  totalPages: number;
  totalNumberOfAssets: number;
}

//meta data
export type metaDataType = {
  metadata: {
    tags: string[];
    extension: string;
    size: number;
  };
  _id: string;
  approval: string;
  fileType: string;
  owner: string;
  title: string;
};

// dash board
interface data {
  totalAssets: number;
  expiringSoon: number;
  duplicates: number;
  expired: number;
  failed: number;
  riskLevel: string;
}
export interface StateData {
  counts: data;
  percentages: {
    duplicatePercentage: string;
    failedPercentage: string;
  };
}
export interface chartType {
  date: [];
  count: [];
}
