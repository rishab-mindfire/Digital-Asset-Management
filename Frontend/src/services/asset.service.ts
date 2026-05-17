import { api } from './apiInterceptor';
import { handleError } from '../utils/handleError';
import { logger } from '../utils/logger';

// Get Asset Details
export const getAssetDetails = async (id: string) => {
  try {
    const response = await api.get(`/assetsDetails/${id}`);

    return response.data;
  } catch (error: unknown) {
    const message = handleError(error);
    logger.error(message);
    throw new Error(message, {
      cause: error,
    });
  }
};

// Approve Asset
export const approveAsset = async (id: string) => {
  try {
    const response = await api.post(`/markassets/${id}`);

    return response.data;
  } catch (error: unknown) {
    const message = handleError(error);
    logger.error(message);
    throw new Error(message, {
      cause: error,
    });
  }
};

// Delete Asset
export const removeAsset = async (id: string) => {
  try {
    const response = await api.delete(`/assets/${id}`);

    return response.data;
  } catch (error: unknown) {
    const message = handleError(error);
    logger.error(message);
    throw new Error(message, {
      cause: error,
    });
  }
};

/**
 * Triggers a native browser download for an asset.
 * Using window.location.href avoids the memory limits of Axios Blobs,
 */
export const triggerAssetDownload = (id: string) => {
  const token = localStorage.getItem(import.meta.env.VITE_TOKEN_KEY);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  if (!token) {
    throw new Error('Authentication token missing');
  }

  // Construct the URL
  const downloadUrl = `${baseUrl}/admin/downloadAsset/${id}?token=${token}`;

  // Trigger the browser's native download manager
  window.location.href = downloadUrl;
};
