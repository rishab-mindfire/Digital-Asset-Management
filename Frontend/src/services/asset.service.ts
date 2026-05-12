import { api } from './apiInterceptor';
import { getErrorMessage } from '../utils/getErrorMessage';
import { logger } from '../utils/logger';

// Get Asset Details
export const getAssetDetails = async (id: string) => {
  try {
    const response = await api.get(`/assetsDetails/${id}`);

    return response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);

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
    const message = getErrorMessage(error);

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
    const message = getErrorMessage(error);

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
    const message = getErrorMessage(error);

    logger.error(message);

    throw new Error(message, {
      cause: error,
    });
  }
};
