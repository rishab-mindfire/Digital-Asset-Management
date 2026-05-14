import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminServices } from '../src/services/admin.service.js';
import { AssetModel } from '../src/models/asset.model.js';
import { calculateRiskLevel } from '../src/helper/Asset.helper.js';

vi.mock('../src/models/asset.model.js', () => ({
  AssetModel: {
    countDocuments: vi.fn(),
    aggregate: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findByIdAndUpdate: vi.fn(),
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

vi.mock('fs/promises', () => ({
  default: {
    stat: vi.fn(),
  },
}));

describe('AdminServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      vi.mocked(AssetModel.countDocuments)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);

      vi.mocked(calculateRiskLevel).mockReturnValue('LOW');

      const result = await adminServices.getDashboardStats();

      expect(result.counts.totalAssets).toBe(100);

      expect(result.counts.duplicates).toBe(5);

      expect(result.percentages.duplicatePercentage).toBe('5.00%');

      expect(calculateRiskLevel).toHaveBeenCalled();
    });
  });

  describe('getChartDataService', () => {
    it('should return formatted chart data', async () => {
      vi.mocked(AssetModel.aggregate).mockResolvedValue([
        {
          _id: '2026-05-14',
          count: 10,
        },
        {
          _id: '2026-05-15',
          count: 20,
        },
      ]);

      const result = await adminServices.getChartDataService();

      expect(result).toEqual({
        date: ['2026-05-14', '2026-05-15'],
        count: [10, 20],
      });
    });
  });
});
