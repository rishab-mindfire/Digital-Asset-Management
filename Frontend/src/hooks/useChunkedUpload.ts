import { useState } from 'react';
import { AxiosError } from 'axios';
import { api } from '../services/apiInterceptor';
import type { MergePayload, UploadOptions } from '../models/Types';

interface UploadResponse {
  message: string;
  data?: unknown;
}

interface ApiErrorResponse {
  message: string;
}

const useChunkedUpload = (options: UploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Track progress per file using filename as the key
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  const [error, setError] = useState<string | null>(null);

  const CHUNK_SIZE = options.chunkSize || 5 * 1024; // 5kb

  const uploadSingleFile = async (file: File): Promise<UploadResponse> => {
    const uploadId = `chunkID-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    for (let i = 1; i <= totalChunks; i++) {
      const start = (i - 1) * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);

      const chunk = file.slice(start, end);

      const formData = new FormData();

      formData.append('file', chunk, file.name);
      formData.append('chunkIndex', i.toString());
      formData.append('uploadId', uploadId);
      formData.append('totalChunks', totalChunks.toString());

      await api.post('/admin/upload/chunk', formData);

      // Update progress for this specific file
      const currentProgress = Math.round((i / totalChunks) * 100);

      setProgressMap((prev) => ({
        ...prev,
        [file.name]: currentProgress,
      }));
    }

    const mergePayload: MergePayload = {
      uploadId,
      filename: file.name,
      totalChunks,
    };

    const response = await api.post<UploadResponse>('/admin/upload/merge', mergePayload);

    return response.data;
  };

  const uploadMultipalFiles = async (files: File[]): Promise<UploadResponse[]> => {
    setIsUploading(true);
    setError(null);
    setProgressMap({});

    try {
      const uploadPromises = files.map((file) => uploadSingleFile(file));

      const results = await Promise.all(uploadPromises);

      setIsUploading(false);

      return results;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;

      const errMsg = error.response?.data?.message || 'Upload failed';

      setError(errMsg);
      setIsUploading(false);

      throw new Error(errMsg);
    }
  };

  return {
    uploadMultipalFiles,
    isUploading,
    progressMap,
    error,
  };
};

export default useChunkedUpload;
