/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { adminServices } from '../src/services/admin.service.js';
import { publicService } from '../src/services/public.service.js';
import { getUserDetails } from '../src/services/authRole.service.js';
import { publicCtr } from '../src/controller/public.controller.js';
import { adminCtr } from '../src/controller/admin.controller.js';

// 1. Mock Services
vi.mock('../src/services/admin.service.js');
vi.mock('../src/services/public.service.js');
vi.mock('../src/services/authRole.service.js');
vi.mock('../src/utils/globleError.js', () => ({
  handleControllerError: vi.fn(),
  AppError: class {
    constructor(
      public message: string,
      public statusCode: number,
    ) {}
  },
}));

describe('AdminController Type-Safe Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset Req/Res mocks
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('dashboardCardData', () => {
    it('should return 200 and stats when service succeeds', async () => {
      const mockStats = { counts: { totalAssets: 10 }, percentages: {} };

      vi.mocked(adminServices.getDashboardStats).mockResolvedValue(mockStats as any);

      await adminCtr.dashboardCardData(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockStats);
    });
  });

  describe('mergeChunks', () => {
    it('should throw 401 if userEmail is missing from request', async () => {
      mockReq.body = { uploadId: 'id', filename: 'test.mp4', totalChunks: 5 };

      await adminCtr.mergeChunks(mockReq as Request, mockRes as Response);

      //  triggers handleControllerError
      const { handleControllerError } = await import('../src/utils/globleError.js');
      expect(handleControllerError).toHaveBeenCalledWith(
        mockRes,
        expect.anything(),
        'Merging failed',
      );
    });

    it('should successfully merge when payload is valid', async () => {
      (mockReq as any).userEmail = 'admin@test.com';
      mockReq.body = { uploadId: 'id', filename: 'test.mp4', totalChunks: 5 };

      vi.mocked(getUserDetails).mockResolvedValue({
        userID: '123',
        userRole: 'admin',
        userEmail: 'rr@gmail.com',
        userName: 'rishab',
        userPassword: '1234',
      });
      vi.mocked(adminServices.finalizeMerge).mockResolvedValue({ _id: 'asset_id' } as any);

      await adminCtr.mergeChunks(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Merge complete. Asset pending processing.',
        }),
      );
    });
  });
});

describe('PublicController Type-Safe Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = { query: { page: '1', limit: '10' } };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('getAllAssets', () => {
    it('should return 200 and asset list', async () => {
      const mockResult = { assets: [], total: 0, page: 1, totalPages: 0 };
      vi.mocked(publicService.assetListingService).mockResolvedValue(mockResult as any);

      await publicCtr.getAllAssets(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
      expect(publicService.assetListingService).toHaveBeenCalledWith(mockReq.query);
    });
  });
});
