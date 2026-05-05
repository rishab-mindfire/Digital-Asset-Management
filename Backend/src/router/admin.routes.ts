import { Router } from 'express';
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

// Assets
adminRouter.get('/assets', adminCtr.getAllAssets);
adminRouter.get('/assets/:id', adminCtr.getAssetById);
adminRouter.delete('/assets/:id', adminCtr.deleteAsset);

// Streaming Preview
adminRouter.get('/assets/:id/stream', adminCtr.streamVideo);
