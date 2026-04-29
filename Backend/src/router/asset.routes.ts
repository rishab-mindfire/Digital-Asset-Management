// src/routes/asset.routes.ts
import { Router } from 'express';
import { uploadMiddleware } from '../config/multer.js';
import { uploadAsset } from '../controller/admin.controller.js';

const assetRouter = Router();

assetRouter.post('/upload', uploadMiddleware.single('file'), uploadAsset);

export default assetRouter;
