import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

import authRoleBased from '../src/middlewares/authRoleBased.middleware.js';
import { verifyEmplyeeRole } from '../src/services/authRole.service.js';

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

vi.mock('../src/services/authRole.service.js', () => ({
  verifyEmplyeeRole: vi.fn(),
}));

interface MockRequest extends Partial<Request> {
  headers: {
    authorization?: string;
  };
  userEmail?: string;
}

interface MockResponse extends Partial<Response> {
  status: Mock;
  json: Mock;
}

describe('authRoleBased middleware', () => {
  let req: MockRequest;
  let res: MockResponse;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };

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

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Authentication token missing',
    });

    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if role is not allowed', async () => {
    req.headers.authorization = 'Bearer valid-token';

    const mockedJwtVerify = jwt.verify as Mock;
    mockedJwtVerify.mockReturnValue({
      userEmail: 'test@example.com',
    });

    const mockedVerifyEmployeeRole = verifyEmplyeeRole as Mock;

    mockedVerifyEmployeeRole.mockResolvedValue('user');

    const middleware = authRoleBased('admin');

    await middleware(req as Request, res as Response, next);

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

    const mockedJwtVerify = jwt.verify as Mock;

    mockedJwtVerify.mockReturnValue({
      userEmail: 'admin@example.com',
    });

    const mockedVerifyEmployeeRole = verifyEmplyeeRole as Mock;

    mockedVerifyEmployeeRole.mockResolvedValue('admin');

    const middleware = authRoleBased('admin');

    await middleware(req as Request, res as Response, next);

    expect(jwt.verify).toHaveBeenCalled();

    expect(verifyEmplyeeRole).toHaveBeenCalledWith('admin@example.com');

    expect(req.userEmail).toBe('admin@example.com');

    expect(next).toHaveBeenCalled();
  });

  it('should handle invalid token errors', async () => {
    req.headers.authorization = 'Bearer invalid-token';

    const mockedJwtVerify = jwt.verify as Mock;

    mockedJwtVerify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const middleware = authRoleBased('admin');

    await middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(next).not.toHaveBeenCalled();
  });
});
