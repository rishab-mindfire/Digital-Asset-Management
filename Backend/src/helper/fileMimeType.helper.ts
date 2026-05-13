import path from 'path';

//  Helper or Map for extensions
export const getMimeType = (fileName: string): string => {
  const ext = path.extname(fileName).toLowerCase();

  const mimeMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.pdf': 'application/pdf',
    '.exe': 'application/x-msdownload',
    '.fmp12': 'application/x-filemaker',
    '.zip': 'application/zip',
  };

  return mimeMap[ext] || 'application/octet-stream';
};
