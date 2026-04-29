// Admin Router Module
// Defines endpoints for admin level routes
// Routes incoming requests to specialized controllers for admin dash-board controle
//
import { Router } from 'express';
import { uploadMiddleware } from '../config/multer.js';
import { adminCtr } from '../controller/admin.controller.js';

export const adminRouter = Router();

// admin route
adminRouter.post('/upload', uploadMiddleware.single('file'), adminCtr.uploadAsset);
