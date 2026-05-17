import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AssetDetails from './AssetDetails';
import * as assetService from '../../services/asset.service';
import { mockAssetData } from '../../../test/mock/mockData';

// Mock the services
vi.mock('../../services/asset.service', () => ({
  getAssetDetails: vi.fn(),
  approveAsset: vi.fn(),
  removeAsset: vi.fn(),
  triggerAssetDownload: vi.fn(),
}));

// Mock media player components to isolate AssetDetails logic
vi.mock('./MediaComponents/VideoPlayer', () => ({
  VideoPlayer: () => <div data-testid="video-player" />,
}));
vi.mock('./MediaComponents/ImagePreview', () => ({
  ImagePreview: () => <div data-testid="image-preview" />,
}));
vi.mock('./MediaComponents/PdfViewer', () => ({
  PdfViewer: () => <div data-testid="pdf-viewer" />,
}));

describe('AssetDetails Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // Helper to render the component within a router context
  const renderComponent = (id = '123') => {
    return render(
      <MemoryRouter initialEntries={[`/asset/${id}`]}>
        <Routes>
          <Route path="/asset/:id" element={<AssetDetails />} />
          <Route path="/asset" element={<div>Asset List Page</div>} />
        </Routes>
      </MemoryRouter>,
    );
  };

  it('renders loading state initially and then displays asset data', async () => {
    // Setup mock to return data
    vi.mocked(assetService.getAssetDetails).mockResolvedValue(mockAssetData);

    renderComponent();

    // Verify loading text appears
    expect(screen.getByText(/Loading asset.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Asset: Marketing Image')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByTestId('image-preview')).toBeInTheDocument();
    });
  });

  it('renders VideoPlayer when extension is mp4', async () => {
    // Setup mock for video file type
    vi.mocked(assetService.getAssetDetails).mockResolvedValue({
      ...mockAssetData,
      metadata: { extension: 'mp4' },
    });

    renderComponent();
    // Verify video player component is mounted
    await waitFor(() => {
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
    });
  });

  it('shows "Mark approve" button only for admin users', async () => {
    // Simulate admin session
    localStorage.setItem('userRole-DAM', 'admin');
    vi.mocked(assetService.getAssetDetails).mockResolvedValue(mockAssetData);

    renderComponent();
    // Verify admin-only action button is visible
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Mark asset as approved/i })).toBeInTheDocument();
    });
  });

  it('handles asset deletion and navigates away', async () => {
    // Setup mocks for data fetch and deletion success
    vi.mocked(assetService.getAssetDetails).mockResolvedValue(mockAssetData);
    vi.mocked(assetService.removeAsset).mockResolvedValue({});

    renderComponent();

    // Trigger delete action
    const deleteBtn = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);

    expect(assetService.removeAsset).toHaveBeenCalledWith('123');

    await waitFor(() => {
      expect(screen.getByText('Asset List Page')).toBeInTheDocument();
    });
  });

  it('triggers native browser download when download button is clicked', async () => {
    // Setup the mock data so the UI renders
    vi.mocked(assetService.getAssetDetails).mockResolvedValue(mockAssetData);
    renderComponent();

    // Wait for the component to finish loading and find the button
    const downloadBtn = await screen.findByRole('button', { name: /download/i });

    // Trigger the click
    fireEvent.click(downloadBtn);

    // Assert that the NEW service function was called with the correct ID
    expect(assetService.triggerAssetDownload).toHaveBeenCalledWith('123');
  });

  it('shows error page when service fails', async () => {
    vi.mocked(assetService.getAssetDetails).mockRejectedValue(new Error('Not Found'));

    renderComponent();

    await waitFor(() => {
      // Assuming PageNotFound contains text "404" or similar
      expect(screen.queryByText('Asset Details')).not.toBeInTheDocument();
    });
  });
});
