import { useState, useEffect } from 'react';
import { api } from '../../../services/apiInterceptor';

export const ImagePreview = ({ assetId }: { assetId: string }) => {
  const [src, setSrc] = useState('');

  useEffect(() => {
    api
      .get(`admin/assets/${assetId}?stream=true`, { responseType: 'blob' })
      .then((res) => setSrc(URL.createObjectURL(res.data)));
    return () => {
      if (src) {
        URL.revokeObjectURL(src);
      }
    };
  }, [assetId]);

  return src ? <img src={src} alt="Preview" style={{ height: '50vh' }} /> : <p>Loading Image...</p>;
};
