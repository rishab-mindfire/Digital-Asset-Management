import { describe, it, expect, vi, beforeEach } from 'vitest';
import supertest from 'supertest';

// Mock modules
vi.mock('../src/services/users.service.js', () => ({
  userServices: {
    checkSigninPassword: vi.fn(),
    checkEmail: vi.fn(),
    createUser: vi.fn(),
  },
}));

vi.mock('../src/services/authGeneral.service.js', () => ({
  generateToken: vi.fn(),
}));

vi.mock('../src/services/authRole.service.js', () => ({
  verifyEmplyeeRole: vi.fn(),
}));

// Imports services for mocks
import app from '../src/index';
import { userServices } from '../src/services/users.service.js';
import * as authGeneral from '../src/services/authGeneral.service.js';
import * as authRole from '../src/services/authRole.service.js';
import { mockAuthUserExiest } from './mock/mockData.js';

const request = supertest(app);

describe('User API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // LOGIN SUCCESS
  it('should login and return token', async () => {
    vi.spyOn(userServices, 'checkSigninPassword').mockResolvedValue(true);
    vi.spyOn(authGeneral, 'generateToken').mockReturnValue('mocked-token');
    vi.spyOn(authRole, 'verifyEmplyeeRole').mockResolvedValue('admin');

    const response = await request.post('/user/login').send({
      userEmail: 'test@gmail.com',
      userPassword: '12345',
    });

    expect(response.status).toBe(200);
  });

  // LOGIN VALIDATION FAIL
  it('should return 400 for invalid email format', async () => {
    const response = await request.post('/user/login').send({
      userEmail: 'invalid-email',
      userPassword: '12345',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
  });

  // INVALID CREDENTIALS
  it('should return 401 for wrong credentials', async () => {
    vi.spyOn(userServices, 'checkSigninPassword').mockResolvedValue(false);

    const response = await request.post('/user/login').send({
      userEmail: 'test@gmail.com',
      userPassword: 'wrong',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  // REGISTRATION SUCCESS
  it('should register user successfully', async () => {
    vi.spyOn(userServices, 'checkEmail').mockResolvedValue(null);
    vi.spyOn(userServices, 'createUser').mockResolvedValue(undefined);

    const response = await request.post('/user/register').send({
      userName: 'rishab',
      userRole: 'admin',
      userEmail: 'new@gmail.com',
      userPassword: '12345',
    });

    expect(response.status).toBe(201);
    expect(response.text).toBe('user created successfully !');
  });

  // EMAIL EXISTS
  it('should return 409 if email already exists', async () => {
    vi.spyOn(userServices, 'checkEmail').mockResolvedValue(mockAuthUserExiest);

    const response = await request.post('/user/register').send({
      userName: 'rishab',
      userRole: 'admin',
      userEmail: 'existing@gmail.com',
      userPassword: '12345',
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Email allready exists !');
  });
});
