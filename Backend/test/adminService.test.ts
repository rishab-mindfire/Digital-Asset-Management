import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminServices } from '../src/services/admin.service.js';
import { AssetModel } from '../src/models/asset.model.js';
import * as fileHandlers from '../src/helper/fileHandlers.helper.js';
import * as assetHelper from '../src/helper/Asset.helper.js';
import { publishToQueueForThumbnail } from '../src/queuePublicer/pushAsset.js';
import fs from 'fs/promises';
import { IAsset, ChunkUploadBody, FinalizeMergeBody, MockMulterFile } from '../src/types/index.js';

// --- MOCK FACTORIES ---
vi.mock('../src/models/asset.model.js', () => ({
  AssetModel: {
    countDocuments: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    aggregate: vi.fn(),
  },
}));

vi.mock('../src/models/collection.model.js', () => ({
  CollectionModel: {
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock('../src/helper/fileHandlers.helper.js', () => ({
  getFileSesionDetails: vi.fn(),
  mergeFinalChunks: vi.fn(),
  saveChunkBasedChunkId: vi.fn(),
  saveFileSesionDetails: vi.fn(),
}));

vi.mock('../src/helper/Asset.helper.js', () => ({
  calculateRiskLevel: vi.fn(),
  getFileHash: vi.fn(),
}));

vi.mock('../src/queuePublicer/pushAsset.js', () => ({
  publishToQueueForThumbnail: vi.fn(),
}));

vi.mock('../src/queuePublicer/expireAsset.js', () => ({
  publishToExpirationQueue: vi.fn(),
}));

vi.mock('fs/promises');

describe('AdminServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return formatted stats and calculate risk level', async () => {
      vi.mocked(AssetModel.countDocuments)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(10);

      vi.mocked(assetHelper.calculateRiskLevel).mockReturnValue('Medium');

      const result = await adminServices.getDashboardStats();

      expect(result.counts.totalAssets).toBe(100);
      expect(result.percentages.duplicatePercentage).toBe('20.00%');
      expect(AssetModel.countDocuments).toHaveBeenCalledTimes(5);
    });
  });

  describe('handleChunkUpload', () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      originalname: 'test.mp4',
    } as MockMulterFile;

    const mockBody: ChunkUploadBody = {
      chunkIndex: '1',
      totalChunks: '5',
    };

    it('should save chunk and metadata for the first chunk', async () => {
      const result = await adminServices.handleChunkUpload('upload-123', mockFile, mockBody);

      expect(fileHandlers.saveChunkBasedChunkId).toHaveBeenCalledWith(
        'upload-123',
        1,
        mockFile.buffer,
      );
      expect(result.progress).toBe(20);
    });
  });

  describe('finalizeMerge', () => {
    const mockUser = { userID: 'user-1', userRole: 'admin' };
    const mockBody: FinalizeMergeBody = {
      title: 'New Video',
      department: 'IT',
      collectionId: 'coll-1',
    };

    // Explicitly type the session metadata
    const mockSession = {
      originalFilename: 'video.mp4',
      totalChunks: 5,
    };

    beforeEach(() => {
      vi.mocked(fileHandlers.getFileSesionDetails).mockResolvedValue(mockSession as unknown);
      vi.mocked(fileHandlers.mergeFinalChunks).mockResolvedValue('/path/to/video.mp4');
      vi.mocked(assetHelper.getFileHash).mockResolvedValue('hash-123');
      // Mocking fs.stat result using the Stats type
      vi.mocked(fs.stat).mockResolvedValue({ size: 1024 } as import('fs').Stats);
    });

    it('should process a unique asset and publish to queues', async () => {
      vi.mocked(AssetModel.findOne).mockResolvedValue(null);

      // Use Partial<IAsset> for the mock return value
      const mockCreatedAsset = {
        _id: 'asset-123',
        fileType: 'video',
      } as Partial<IAsset>;

      vi.mocked(AssetModel.findOneAndUpdate).mockResolvedValue(mockCreatedAsset);

      const result = await adminServices.finalizeMerge('upload-123', mockBody, mockUser);

      expect(AssetModel.findOneAndUpdate).toHaveBeenCalledWith(
        { uploadId: 'upload-123' },
        expect.objectContaining({ status: 'pending' }),
        { upsert: true, new: true },
      );
      expect(publishToQueueForThumbnail).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle duplicates by skipping queue', async () => {
      const existingAsset = {
        _id: 'old-id',
        thumbnailPath: '/thumb.jpg',
        status: 'uploaded',
      } as Partial<IAsset>;

      vi.mocked(AssetModel.findOne).mockResolvedValue(existingAsset);
      vi.mocked(AssetModel.findOneAndUpdate).mockResolvedValue(existingAsset);

      await adminServices.finalizeMerge('upload-123', mockBody, mockUser);

      expect(publishToQueueForThumbnail).not.toHaveBeenCalled();

      const calls = vi.mocked(AssetModel.findOneAndUpdate).mock.calls[0];
      // Asserting the second argument of the call as Partial<IAsset>
      const payload = calls[1] as Partial<IAsset>;
      expect(payload.status).toBe('uploaded');
      expect(payload.thumbnailPath).toBe('/thumb.jpg');
    });

    it('should rollback status if queue publishing fails', async () => {
      vi.mocked(AssetModel.findOne).mockResolvedValue(null);
      vi.mocked(AssetModel.findOneAndUpdate).mockResolvedValue({
        _id: 'asset-123',
        fileType: 'video',
      } as Partial<IAsset>);

      vi.mocked(publishToQueueForThumbnail).mockRejectedValue(new Error('Queue Down'));

      await expect(adminServices.finalizeMerge('upload-123', mockBody, mockUser)).rejects.toThrow(
        'Merge successful, but processing queue failed',
      );

      expect(AssetModel.findByIdAndUpdate).toHaveBeenCalledWith('asset-123', { status: 'failed' });
    });
  });
});
