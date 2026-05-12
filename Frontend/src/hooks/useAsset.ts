import { useState, useEffect } from 'react';
import { api } from '../services/apiInterceptor';

export type FileCategory = 'image' | 'video' | 'pdf' | 'png' | 'other';

export const useAsset = (assetId: string | undefined) => {
  // const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<FileCategory>('other');

  useEffect(() => {
    if (!assetId) {
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/assetsDetails/${assetId}`);
        const assetExtension = response.data;
        const ext = assetExtension || '';

        // Determine category based on extension
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(assetExtension)) {
          setCategory('image');
        } else if (['mp4', 'mov', 'webm'].includes(ext)) {
          setCategory('video');
        } else if (ext === 'pdf') {
          setCategory('pdf');
        } else {
          setCategory('other');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load asset');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [assetId]);

  const getStreamUrl = () => {
    return assetId ? `/assets/${assetId}?stream=true` : '';
  };

  return { loading, error, category, getStreamUrl };
};
