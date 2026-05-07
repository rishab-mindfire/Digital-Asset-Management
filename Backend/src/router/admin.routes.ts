import { Router } from 'express';
import { adminCtr } from '../controller/admin.controller.js';
import multer from 'multer';
import { assetAdmin } from '../controller/adminAssets.controller.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const adminRouter = Router();

// Dashboard
adminRouter.get('/dashboard/stats', assetAdmin.dashboard);
// Assets
adminRouter.get('/assets', assetAdmin.getAllAssets);
adminRouter.get('/assets/:id', assetAdmin.getAssetById);
adminRouter.delete('/assets/:id', assetAdmin.deleteAssetById);
// Streaming Preview
adminRouter.get('/assets/:id/stream', assetAdmin.streamVideo);

// Chunked Upload Pipeline
adminRouter.post('/upload/chunk', upload.single('file'), adminCtr.uploadChunk);
adminRouter.post('/upload/merge', adminCtr.mergeChunks);
