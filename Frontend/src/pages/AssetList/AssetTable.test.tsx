import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AssetTable from './AssetTable';
import * as useChunkedUploadHook from '../../hooks/useChunkedUpload';
import * as usePaginationHook from '../../hooks/usePagination';

// Mock the hooks
vi.mock('../../hooks/useChunkedUpload');
vi.mock('../../hooks/usePagination');

describe('AssetTable Component', () => {
  const mockFetchAssets = vi.fn();
  const mockSetSearch = vi.fn();

  const mockPaginationData = {
    assets: [
      {
        id: '1',
        name: 'Asset 1',
        type: 'Image',
        Approval: 'Approved',
        owner: 'User A',
        updated: '2023-01-01',
      },
    ],
    pagination: { page: 1, totalPages: 1 },
    fetchAssets: mockFetchAssets,
    setSearch: mockSetSearch,
    search: '',
    totalNumberOfAssets: 1,
  };

  const mockUploadData = {
    uploadMultipalFiles: vi.fn(),
    isUploading: false,
    progressMap: {},
    setProgressMap: vi.fn(),
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (usePaginationHook.default as any).mockReturnValue(mockPaginationData);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useChunkedUploadHook.default as any).mockReturnValue(mockUploadData);

    // Mock LocalStorage
    Storage.prototype.getItem = vi.fn().mockReturnValue('admin');
  });

  it('renders the asset table with data', () => {
    render(
      <MemoryRouter>
        <AssetTable />
      </MemoryRouter>,
    );

    expect(screen.getByText('Asset Overview')).toBeDefined();
    expect(screen.getByText('Asset 1')).toBeDefined();
    expect(screen.getByText('Approved')).toBeDefined();
  });

  it('opens the upload modal when clicking the upload button', async () => {
    render(
      <MemoryRouter>
        <AssetTable />
      </MemoryRouter>,
    );

    const uploadBtn = screen.getByText(/\+ Upload/i);
    fireEvent.click(uploadBtn);

    expect(screen.getByText('Upload Asset')).toBeDefined();
    const dropZone = await screen.findByText(/Drag files here/i);
    expect(dropZone).toBeDefined();
  });

  it('updates search value and triggers debounce effect', async () => {
    render(
      <MemoryRouter>
        <AssetTable />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText('Search assets...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'New Search' } });

    // Finding by role and casting
    expect(searchInput.value).toBe('New Search');
    // Wait for debounce (600ms)
    await waitFor(
      () => {
        expect(mockSetSearch).toHaveBeenCalledWith('New Search');
      },
      { timeout: 1000 },
    );
  });

  it('shows a spinner when isUploading is true', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useChunkedUploadHook.default as any).mockReturnValue({
      ...mockUploadData,
      isUploading: true,
    });

    render(
      <MemoryRouter>
        <AssetTable />
      </MemoryRouter>,
    );

    expect(document.querySelector('.spinner')).toBeDefined();
  });
});
