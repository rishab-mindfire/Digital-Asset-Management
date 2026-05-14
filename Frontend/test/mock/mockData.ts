import type useChunkedUpload from '../../src/hooks/useChunkedUpload';
import type usePagination from '../../src/hooks/usePagination';

export const mockChartData = { date: ['2023-01-01'], count: [10] };
export const mockCardData = {
  counts: {
    totalAssets: 100,
    expiringSoon: 5,
    duplicates: 2,
    expired: 1,
    failed: 0,
    riskLevel: 'Low',
  },
  percentages: { duplicatePercentage: '2%', failedPercentage: '0%' },
};

// mock data to match AssetApiResponse
export const mockApiResponse = {
  data: {
    assets: [
      {
        _id: '1',
        title: 'Nature Photo',
        fileType: 'image/jpeg',
        approval: 'approved',
        owner: 'Admin',
        updatedAt: '2024-05-13T10:00:00Z',
      },
    ],
    total: 1,
    page: 1,
    totalPages: 1,
    totalNumberOfAssets: 1,
  },
};

// Extract types from the hooks
export type UsePaginationReturn = ReturnType<typeof usePagination>;
export type UseChunkedUploadReturn = ReturnType<typeof useChunkedUpload>;
export const mockAssets: UsePaginationReturn['assets'] = [
  {
    id: 'asset-1',
    name: 'Document.pdf',
    type: 'PDF',
    Approval: 'Approved',
    owner: 'Admin User',
    updated: '13/05/2026',
  },
];
export const mockPagination: UsePaginationReturn['pagination'] = {
  total: 30,
  page: 1,
  totalPages: 3,
};
