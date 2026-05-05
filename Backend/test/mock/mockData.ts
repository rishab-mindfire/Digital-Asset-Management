import { JwtPayload } from 'jsonwebtoken';
import { userServices } from '../../src/services/users.service';

// --- other services Mocks ---

// --- User service Mocks ---
export const mockAuthUser = {
  _id: '65f1a2b3c4d5e6f7a8b9c0d1',
  email: 'test@example.com',
} as unknown as Awaited<ReturnType<typeof userServices.checkEmail>>;

// --- User existing  ---
export const mockAuthUserExiest = {
  _id: '65f1a2b3c4d5e6f7a8b9c0d1',
  userEmail: 'existing@gmail.com',
} as unknown as Awaited<ReturnType<typeof userServices.checkEmail>>;

// --- Auth Mocks ---
export const mockJwtSecret = 'test-secret-key';
export const mockJwtToken = 'header.payload.signature';
export const mockDecodedUser: JwtPayload = {
  userEmail: 'test@example.com',
  iat: 123456789,
  exp: 123456789 + 60 * 60 * 12,
};
