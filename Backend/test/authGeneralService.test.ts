import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { mockDecodedUser, mockJwtSecret, mockJwtToken } from './mock/mockData';
import { verifyTokenAndGetUser } from '../src/services/authGeneral.service';

vi.mock('jsonwebtoken');

describe('Auth Utilities', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', mockJwtSecret);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('verify Token And Get User', () => {
    it('should return decoded payload for a valid token', () => {
      vi.mocked(jwt.verify).mockReturnValue(mockDecodedUser as unknown as JwtPayload & void);
      // grab token based on mock user
      const result = verifyTokenAndGetUser(mockJwtToken);
      // match with testing user email
      expect(result).toEqual(mockDecodedUser);
      expect((result as JwtPayload).userEmail).toBe('test@example.com');
    });

    it('should return null if jwt.verify throws an error', () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      //any invalid token the header should be null
      const result = verifyTokenAndGetUser('invalid-token');
      expect(result).toBeNull();
    });
  });
});
