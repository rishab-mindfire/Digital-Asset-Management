// User Registration
export interface UserType {
  userID: string;
  userName: string;
  userEmail: string;
  userPassword: string;
  role: string;
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
