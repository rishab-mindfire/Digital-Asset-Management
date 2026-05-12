import { useState, useEffect } from 'react';
import { api } from '../../../services/apiInterceptor';
import style from '../AssetDetails.module.css';

export const PdfViewer = ({ assetId }: { assetId: string }) => {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let url = '';
    api.get(`/assets/${assetId}?stream=true`, { responseType: 'blob' }).then((res) => {
      url = URL.createObjectURL(res.data);
      setSrc(url);
    });

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [assetId]);

  return src ? (
    <iframe src={src} className={style.previewPDF} title="PDF" />
  ) : (
    <p>Loading PDF...</p>
  );
};
