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

// Download Asset
export const downloadAsset = async (id: string) => {
  try {
    const response = await api.get(`/admin/downloadAsset/${id}`, {
      responseType: 'blob',
    });

    return response;
  } catch (error: unknown) {
    const message = handleError(error);

    logger.error(message);

    throw new Error(message, {
      cause: error,
    });
  }
};
