import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { assetService } from '../src/services/asset.service.js';
import { AssetModel } from '../src/models/asset.model.js';
import { IAsset } from '../src/types/index.js';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { mockDecodedUser, mockJwtSecret, mockJwtToken } from '../test/mock/mockData.js';
import { Response } from 'express';
import { verifyTokenAndGetUser } from '../src/services/authGeneral.service.js';
import { Query } from 'mongoose';

// Mocking dependencies
vi.mock('../src/models/asset.model.js');
vi.mock('../src/models/collection.model.js');
vi.mock('../src/models/usagetracking.model.js');
vi.mock('../src/queuePublicer/pushAsset.js');
vi.mock('../src/queuePublicer/expireAsset.js');
vi.mock('fs/promises');
vi.mock('../src/helper/fileHandlers.helper.js');
vi.mock('../src/helper/Asset.helper.js', () => ({
  calculateRiskLevel: vi.fn(() => 'High'),
  getFileHash: vi.fn(async () => 'mocked_hash'),
}));
vi.mock('jsonwebtoken');

describe('AssetManagement Strict Type Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('assetListingService', () => {
    it('should handle pagination using strict interface mocking', async () => {
      // Create a mock asset that matches the IAsset interface
      const mockAsset = {
        title: 'Asset 1',
        fileType: 'image',
        updatedAt: new Date(),
      } as IAsset;

      // Define a mock query that implements only the methods
      const mockQuery = {
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockResolvedValue([mockAsset]),
      } as unknown as Query<IAsset[], IAsset>;

      vi.mocked(AssetModel.find).mockReturnValue(mockQuery);
      vi.mocked(AssetModel.countDocuments).mockImplementation(async () => 1);

      const result = await assetService.assetListingService({
        page: '1',
        limit: '10',
      });

      expect(result.assets[0].title).toBe('Asset 1');
      expect(result.total).toBe(1);
    });
  });

  describe('getAssetForDownload', () => {
    it('should mock Express Response using Partial utility', async () => {
      // Mock findById to resolve to null (simulating not found)
      vi.mocked(AssetModel.findById).mockImplementation(
        () =>
          ({
            exec: vi.fn().mockResolvedValue(null),
          }) as unknown as Query<IAsset | null, IAsset>,
      );

      //
      const mockRes: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      await assetService.getAssetForDownload('invalid-id', mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});

describe('Auth Utilities Test', () => {
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
