import { describe, it, expect, vi, beforeEach } from 'vitest';
import supertest from 'supertest';
import app from '../src/index';

// Mock required modules
vi.mock('../src/services/users.service');
vi.mock('../src/services/authRole.service');
vi.mock('../src/services/authGeneral.service');

// Import services for there test with mocks data
import * as userServices from '../src/services/users.service';

const request = supertest(app);

describe('User Login API Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // ---------------- INVALID EMAIL ----------------
  it('should return 400 for invalid email format', async () => {
    const response = await request.post('/user/login').send({
      userEmail: 'myaccountgmail.com',
      userPassword: '123456',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.details).toBe('Email must be a valid email');
  });

  // ---------------- WRONG PASSWORD ----------------
  it('should return 401 for invalid credentials', async () => {
    vi.mocked(userServices.userServices.checkSigninPassword).mockResolvedValue(false);

    const response = await request.post('/user/login').send({
      userEmail: 'myaccount@gmail.com',
      userPassword: 'wrongpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });
});
