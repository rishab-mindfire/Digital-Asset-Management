import { Router } from 'express';
import { adminCtr } from '../controller/admin.controller.js';
import multer from 'multer';
import { assetAdmin } from '../controller/adminAssets.controller.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const adminRouter = Router();

// Assets
adminRouter.get('/assets', assetAdmin.getAllAssets);
adminRouter.get('/assets/:id', assetAdmin.getAssetById);
adminRouter.delete('/assets/:id', assetAdmin.deleteAssetController);
adminRouter.get('/assetsDetails/:id', assetAdmin.metaDataDetalis);
adminRouter.post('/markassets/:id', assetAdmin.markApprove);

// Dashboard and upload files
adminRouter.get('/dashboardData/stats', adminCtr.dashboardCardData);
adminRouter.get('/dashboardChart/stats', adminCtr.dashboardChart);
adminRouter.post('/upload/chunk', upload.single('file'), adminCtr.uploadChunk);
adminRouter.post('/upload/merge', adminCtr.mergeChunks);
