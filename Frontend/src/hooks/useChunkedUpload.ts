import { useState } from 'react';
import { api } from '../services/apiInterceptor';
import type { MergePayload, UploadOptions } from '../models/Types';

const useChunkedUpload = (options: UploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const CHUNK_SIZE = options.chunkSize || 5 * 1024 * 1024; // 5MB

  const uploadFile = async (file: File): Promise<any> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    const uploadId = `chunkID-${Date.now()}`;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    try {
      // Upload Chunks sequentially
      for (let i = 1; i <= totalChunks; i++) {
        const start = (i - 1) * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk, file.name);
        formData.append('chunkIndex', i.toString());
        formData.append('uploadId', uploadId);
        formData.append('totalChunks', totalChunks.toString());

        await api.post('/admin/upload/chunk', formData);

        // Calculate progress accurately based on completed chunks
        const currentProgress = Math.round((i / totalChunks) * 100);
        setProgress(currentProgress);
      }

      // Merge payload
      const mergePayload: MergePayload = {
        uploadId,
        filename: file.name,
        totalChunks,
      };

      const response = await api.post('/admin/upload/merge', mergePayload);
      setIsUploading(false);
      return response.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Upload failed';
      setError(errMsg);
      setIsUploading(false);
      throw new Error(errMsg);
    }
  };

  return { uploadFile, isUploading, progress, error };
};

export default useChunkedUpload;
