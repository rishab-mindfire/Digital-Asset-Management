import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import AssetTable from './AssetTable';

// Import hooks to extract their return types
import useChunkedUpload from '../../hooks/useChunkedUpload';
import usePagination from '../../hooks/usePagination';
import {
  mockAssets,
  mockPagination,
  type UseChunkedUploadReturn,
  type UsePaginationReturn,
} from '../../../test/mock/mockData';

//  Mock the custom hooks
vi.mock('../../hooks/useChunkedUpload');
vi.mock('../../hooks/usePagination');

//  Mock child components with explicit prop types
vi.mock('../../components/modal/Modal', () => ({
  default: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
    isOpen ? <div data-testid="modal-container">{children}</div> : null,
}));

vi.mock('../../components/common/Loader', () => ({
  default: () => <div data-testid="loading-spinner" />,
}));

describe('AssetTable Component', () => {
  // Define mock functions with Vitest Mock type
  const mockFetchAssets: Mock = vi.fn();
  const mockSetSearch: Mock = vi.fn();
  const mockUploadFiles: Mock = vi.fn();

  // Matches hook: { total, page, totalPages }
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock usePagination return values
    vi.mocked(usePagination).mockReturnValue({
      assets: mockAssets,
      pagination: mockPagination,
      loadingAssets: false,
      fetchAssets: mockFetchAssets,
      setSearch: mockSetSearch,
      search: '',
    } as UsePaginationReturn);

    // Mock useChunkedUpload return values
    vi.mocked(useChunkedUpload).mockReturnValue({
      uploadMultipalFiles: mockUploadFiles,
      isUploading: false,
      progressMap: {},
      setProgressMap: vi.fn(),
      error: null,
    } as UseChunkedUploadReturn);
  });

  it('renders the asset table with formatted hook data', () => {
    render(
      <MemoryRouter>
        <AssetTable />
      </MemoryRouter>,
    );

    expect(screen.getByText('Asset Overview')).toBeInTheDocument();
    expect(screen.getByText('Document.pdf')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });
  //search debounce test for 600 micro second
  it('triggers search with 600ms debounce', async () => {
    render(
      <MemoryRouter>
        <AssetTable />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText('Search assets...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'nature' } });

    // Should not call setSearch immediately
    expect(mockSetSearch).not.toHaveBeenCalled();

    // Fast-forward 600ms
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(mockSetSearch).toHaveBeenCalledWith('nature');
  });

  it('displays the Loader when loadingAssets is true', () => {
    vi.mocked(usePagination).mockReturnValue({
      assets: [],
      pagination: mockPagination,
      loadingAssets: true,
      fetchAssets: mockFetchAssets,
      setSearch: mockSetSearch,
      search: '',
    } as UsePaginationReturn);

    render(
      <MemoryRouter>
        <AssetTable />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('disables "Previous" on page 1 and "Next" on the last page', () => {
    // page 1 state
    render(
      <MemoryRouter>
        <AssetTable />
      </MemoryRouter>,
    );

    const prevBtn = screen.getByRole('button', { name: /Previous/i });
    expect(prevBtn).toBeDisabled();

    // Mock last page state
    vi.mocked(usePagination).mockReturnValue({
      assets: mockAssets,
      pagination: { total: 30, page: 3, totalPages: 3 },
      loadingAssets: false,
      fetchAssets: mockFetchAssets,
      setSearch: mockSetSearch,
      search: '',
    } as UsePaginationReturn);

    render(
      <MemoryRouter>
        <AssetTable />
      </MemoryRouter>,
    );

    const nextButtons = screen.getAllByRole('button', { name: /Next/i });
    // Using index 1 because the second render adds another button to the screen in tests
    expect(nextButtons[nextButtons.length - 1]).toBeDisabled();
  });

  it('calls fetchAssets with specific page numbers', () => {
    render(
      <MemoryRouter>
        <AssetTable />
      </MemoryRouter>,
    );

    const nextBtn = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextBtn);

    expect(mockFetchAssets).toHaveBeenCalledWith(2);
  });
});
