import axios from 'axios';

export const handleError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string })?.message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown Error';
};
