import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, type Mocked } from 'vitest';
import usePagination from './usePagination';
import { api } from '../services/apiInterceptor';
import { mockApiResponse } from '../../test/mock/mockData';
import type { AssetApiResponse } from '../models/Types';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Mock the API interceptor
vi.mock('../services/apiInterceptor', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('usePagination Hook test', () => {
  // Cast api as Mocked to get mock methods
  const mockedApi = api as Mocked<typeof api>;

  beforeEach(() => {
    vi.clearAllMocks();
  });
  //initially page will be 1 with 0 data innitially
  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination());

    expect(result.current.assets).toEqual([]);
    expect(result.current.loadingAssets).toBe(false);
    expect(result.current.search).toBe('');
    expect(result.current.pagination).toEqual({
      total: 0,
      page: 1,
      totalPages: 1,
    });
  });

  it('should fetch and format assets successfully', async () => {
    mockedApi.get.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => usePagination());

    // Trigger the fetch
    await act(async () => {
      await result.current.fetchAssets(1);
    });

    expect(mockedApi.get).toHaveBeenCalledWith(expect.stringContaining('page=1'));
    expect(mockedApi.get).toHaveBeenCalledWith(expect.stringContaining('limit=10'));

    expect(result.current.loadingAssets).toBe(false);
    expect(result.current.assets).toHaveLength(1);

    // Check formatting (Capitalized Approval and Localized Date)
    expect(result.current.assets[0]).toEqual({
      id: '1',
      name: 'Nature Photo',
      type: 'image/jpeg',
      Approval: 'Approved',
      owner: 'Admin',
      updated: expect.any(String), // Date format varies by environment locale
    });

    expect(result.current.pagination.total).toBe(1);
  });

  it('should handle search filters', async () => {
    mockedApi.get.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => usePagination());

    // Update search state
    act(() => {
      result.current.setSearch('sunset');
    });

    expect(result.current.search).toBe('sunset');

    // Fetch with updated search
    await act(async () => {
      await result.current.fetchAssets(1);
    });

    // Check if the URLSearchParams included the search term
    expect(mockedApi.get).toHaveBeenCalledWith(expect.stringContaining('search=sunset'));
  });

  it('should set loading state correctly during fetch', async () => {
    // Define the resolver type explicitly using AxiosResponse and custom Data type
    let resolveApi: (value: AxiosResponse<AssetApiResponse>) => void;

    const delayedPromise = new Promise<AxiosResponse<AssetApiResponse>>((resolve) => {
      resolveApi = resolve;
    });

    mockedApi.get.mockReturnValue(delayedPromise);

    const { result } = renderHook(() => usePagination());

    // Start the fetch (setAssetLoading(true))
    let fetchPromise: Promise<void>;
    act(() => {
      fetchPromise = result.current.fetchAssets(1);
    });

    expect(result.current.loadingAssets).toBe(true);

    // resolveApi with mock data
    await act(async () => {
      resolveApi({
        data: mockApiResponse.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        request: {},
      });
      await fetchPromise!;
    });

    expect(result.current.loadingAssets).toBe(false);
  });

  it('should handle API errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedApi.get.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => usePagination());

    await act(async () => {
      await result.current.fetchAssets(1);
    });

    expect(result.current.loadingAssets).toBe(false);
    expect(result.current.assets).toEqual([]); // State should remain unchanged or empty
    consoleSpy.mockRestore();
  });
});
