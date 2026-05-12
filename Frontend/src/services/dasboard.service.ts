import { logger } from '../utils/logger';
import { api } from './apiInterceptor';

// Get Chart Data
export const getChartData = async () => {
  try {
    const response = await api.get('/dashboardChart/stats');

    return response.data;
  } catch (error) {
    logger.error(`Chart API Error: ${error}`);
    throw error;
  }
};

// Get Card Data
export const getCardData = async () => {
  try {
    const response = await api.get('/dashboardData/stats');

    return response.data;
  } catch (error) {
    logger.error(`Card API Error: ${error}`);
    throw error;
  }
};
