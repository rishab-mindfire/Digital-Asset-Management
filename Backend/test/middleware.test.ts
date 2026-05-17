import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

import authRoleBased from '../src/middlewares/authRoleBased.middleware.js';
import { verifyEmplyeeRole } from '../src/services/authRole.service.js';

// Mock jsonwebtoken to properly spy on both default and named export calls
vi.mock('jsonwebtoken', () => {
  const mockVerify = vi.fn();
  return {
    default: {
      verify: mockVerify,
    },
    verify: mockVerify,
  };
});

// Mock the employee role service function
vi.mock('../src/services/authRole.service.js', () => ({
  verifyEmplyeeRole: vi.fn(),
}));

// Extend the Request interface to allow optional query and custom parameters
interface MockRequest extends Partial<Request> {
  method?: string;
  headers: {
    authorization?: string;
  };
  query?: Record<string, any>;
  userEmail?: string;
}

// Extend the Response interface to type mock functions properly
interface MockResponse extends Partial<Response> {
  status: Mock;
  json: Mock;
}

describe('authRoleBased middleware', () => {
  let req: MockRequest;
  let res: MockResponse;
  let next: NextFunction;

  beforeEach(() => {
    // Set up mock process environment for the token secret
    process.env.JWT_SECRET = 'test-secret';

    // Initialize request with safe defaults to prevent middleware extraction crashes
    req = {
      method: 'GET',
      headers: {},
      query: {},
    };

    // Initialize response mocks ensuring status allows method chaining
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    next = vi.fn();

    vi.clearAllMocks();
  });

  it('should return 401 if token is missing', async () => {
    const middleware = authRoleBased('admin');

    await middleware(req as Request, res as Response, next);

    // Assertions for missing token payload response
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Authentication token missing',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if role is not allowed', async () => {
    req.headers.authorization = 'Bearer valid-token';

    // Stub jwt verify method to yield an unauthorized payload
    const mockedJwtVerify = jwt.verify as Mock;
    mockedJwtVerify.mockReturnValue({
      userEmail: 'test@example.com',
    });

    // Stub role service to resolve to a non-permitted role
    const mockedVerifyEmployeeRole = verifyEmplyeeRole as Mock;
    mockedVerifyEmployeeRole.mockResolvedValue('user');

    const middleware = authRoleBased('admin');

    await middleware(req as Request, res as Response, next);

    // Assertions for failed permission checks
    expect(jwt.verify).toHaveBeenCalled();
    expect(verifyEmplyeeRole).toHaveBeenCalledWith('test@example.com');
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied: Insufficient permissions',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if user has valid role', async () => {
    req.headers.authorization = 'Bearer valid-token';

    // Stub jwt verification payload with authorized user email
    const mockedJwtVerify = jwt.verify as Mock;
    mockedJwtVerify.mockReturnValue({
      userEmail: 'admin@example.com',
    });

    // Stub role service to resolve into a valid permission set
    const mockedVerifyEmployeeRole = verifyEmplyeeRole as Mock;
    mockedVerifyEmployeeRole.mockResolvedValue('admin');

    const middleware = authRoleBased('admin');

    await middleware(req as Request, res as Response, next);

    // Assertions verifying user metadata attachment and routing forward
    expect(jwt.verify).toHaveBeenCalled();
    expect(verifyEmplyeeRole).toHaveBeenCalledWith('admin@example.com');
    expect(req.userEmail).toBe('admin@example.com');
    expect(next).toHaveBeenCalled();
  });

  it('should handle invalid token errors', async () => {
    req.headers.authorization = 'Bearer invalid-token';

    // Force jwt verification method to crash and throw an exception
    const mockedJwtVerify = jwt.verify as Mock;
    mockedJwtVerify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const middleware = authRoleBased('admin');

    await middleware(req as Request, res as Response, next);

    // Assertions ensuring safety catch blocks fire correctly
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
