import { useState, useEffect } from 'react';
import { api } from '../../../services/apiInterceptor';
import style from '../AssetDetails.module.css';

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

  return src ? (
    <img src={src} alt="Preview" className={style.previewImage} />
  ) : (
    <p>Loading Image...</p>
  );
};
