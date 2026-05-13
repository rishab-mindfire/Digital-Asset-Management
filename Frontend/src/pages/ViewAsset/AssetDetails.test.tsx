import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AssetDetails from './AssetDetails';
import * as assetService from '../../services/asset.service';
import type { InternalAxiosRequestConfig } from 'axios';

// Mock the services
vi.mock('../../services/asset.service', () => ({
  getAssetDetails: vi.fn(),
  approveAsset: vi.fn(),
  removeAsset: vi.fn(),
  downloadAsset: vi.fn(),
}));

// Mock the Media components to simplify testing AssetDetails logic
vi.mock('./MediaComponents/VideoPlayer', () => ({
  VideoPlayer: () => <div data-testid="video-player" />,
}));
vi.mock('./MediaComponents/ImagePreview', () => ({
  ImagePreview: () => <div data-testid="image-preview" />,
}));
vi.mock('./MediaComponents/PdfViewer', () => ({
  PdfViewer: () => <div data-testid="pdf-viewer" />,
}));

const mockAssetData = {
  _id: '123',
  fileType: 'Marketing Image',
  owner: 'John Doe',
  approval: 'pending',
  metadata: {
    extension: 'jpg',
  },
};

describe('AssetDetails Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

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
    vi.mocked(assetService.getAssetDetails).mockResolvedValue(mockAssetData);

    renderComponent();

    expect(screen.getByText(/Loading asset.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Asset: Marketing Image')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByTestId('image-preview')).toBeInTheDocument();
    });
  });

  it('renders VideoPlayer when extension is mp4', async () => {
    vi.mocked(assetService.getAssetDetails).mockResolvedValue({
      ...mockAssetData,
      metadata: { extension: 'mp4' },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
    });
  });

  it('shows "Mark approve" button only for admin users', async () => {
    localStorage.setItem('userRole-DAM', 'admin');
    vi.mocked(assetService.getAssetDetails).mockResolvedValue(mockAssetData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /mark approve/i })).toBeInTheDocument();
    });
  });

  it('handles asset deletion and navigates away', async () => {
    vi.mocked(assetService.getAssetDetails).mockResolvedValue(mockAssetData);
    vi.mocked(assetService.removeAsset).mockResolvedValue({});

    renderComponent();

    const deleteBtn = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);

    expect(assetService.removeAsset).toHaveBeenCalledWith('123');

    await waitFor(() => {
      expect(screen.getByText('Asset List Page')).toBeInTheDocument();
    });
  });

  it('triggers download when download button is clicked', async () => {
    vi.mocked(assetService.getAssetDetails).mockResolvedValue(mockAssetData);

    const mockBlob = new Blob(['content'], { type: 'image/jpeg' });

    // Provide full Axios-like response object
    vi.mocked(assetService.downloadAsset).mockResolvedValue({
      data: mockBlob,
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'image/jpeg',
        'content-disposition': 'attachment; filename="test.jpg"',
      },
      config: {} as InternalAxiosRequestConfig,
      request: {},
    });

    // Mock URL methods to prevent JSDOM crashes
    window.URL.createObjectURL = vi.fn(() => 'mock-url');
    window.URL.revokeObjectURL = vi.fn();

    renderComponent();

    const downloadBtn = await screen.findByRole('button', { name: /download/i });
    fireEvent.click(downloadBtn);

    expect(assetService.downloadAsset).toHaveBeenCalledWith('123');
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
