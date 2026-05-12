import { Router } from 'express';
import { adminCtr } from '../controller/admin.controller.js';
import multer from 'multer';
import { publicCtr } from '../controller/public.controller.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const publicRouter = Router();

// Assets
publicRouter.get('/assets', publicCtr.getAllAssets);

// Dashboard and upload files
publicRouter.get('/dashboardData/stats', adminCtr.dashboardCardData);
publicRouter.get('/dashboardChart/stats', adminCtr.dashboardChart);
publicRouter.post('/upload/chunk', upload.single('file'), adminCtr.uploadChunk);
publicRouter.post('/upload/merge', adminCtr.mergeChunks);
