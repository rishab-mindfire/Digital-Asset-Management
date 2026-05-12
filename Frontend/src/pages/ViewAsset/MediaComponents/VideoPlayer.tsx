import { useState, useEffect } from 'react';
import { api } from '../../../services/apiInterceptor';
import { logger } from '../../../utils/logger';

export const VideoPlayer = ({ assetId, ext }: { assetId: string; ext: string }) => {
  const [src, setSrc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await api.get(`/assets/${assetId}?stream=true`, { responseType: 'blob' });
        const url = URL.createObjectURL(res.data);
        setSrc(url);
      } catch (e) {
        logger.error('Video failed', e);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
    return () => {
      if (src) {
        URL.revokeObjectURL(src);
      }
    };
  }, [assetId]);

  if (loading) {
    return <p>Loading Video...</p>;
  }

  return (
    <video controls style={{ height: '50vh' }}>
      <source src={src} type={`video/${ext === 'mov' ? 'mp4' : ext}`} />
    </video>
  );
};
