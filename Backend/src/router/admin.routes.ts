import { Request, Response, Router } from 'express';
import { adminCtr } from '../controller/admin.controller.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const adminRouter = Router();

// Dashboard
adminRouter.get('/dashboard/stats', adminCtr.getOverview);
// Chunked Upload Pipeline
adminRouter.post('/upload/chunk', upload.single('file'), adminCtr.uploadChunk);
adminRouter.post('/upload/merge', adminCtr.mergeChunks);

// Multiple files upload route
adminRouter.post('/upload-multiple', upload.array('files', 5), (req: Request, res: Response) => {
  // 1. Check if files exist and cast to the Multer file array type
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  // 2. Map through the files with type safety
  const fileData = files.map((file: Express.Multer.File) => ({
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
  }));

  res.json({
    message: 'Files uploaded successfully',
    count: fileData.length,
    files: fileData,
  });
});

// Assets
adminRouter.get('/assets', adminCtr.getAllAssets);
adminRouter.get('/assets/:id', adminCtr.getAssetById);
adminRouter.delete('/assets/:id', adminCtr.deleteAsset);
// Streaming Preview
adminRouter.get('/assets/:id/stream', adminCtr.streamVideo);
