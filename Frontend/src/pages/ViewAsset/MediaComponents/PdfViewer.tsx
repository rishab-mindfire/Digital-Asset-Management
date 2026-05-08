import { useState, useEffect } from 'react';
import { api } from '../../../services/apiInterceptor';

export const PdfViewer = ({ assetId }: { assetId: string }) => {
  const [src, setSrc] = useState('');

  useEffect(() => {
    api
      .get(`admin/assets/${assetId}?stream=true`, { responseType: 'blob' })
      .then((res) => setSrc(URL.createObjectURL(res.data)));
  }, [assetId]);

  return src ? (
    <iframe src={src} style={{ width: '100%', height: '600px' }} title="PDF" />
  ) : (
    <p>Loading PDF...</p>
  );
};
