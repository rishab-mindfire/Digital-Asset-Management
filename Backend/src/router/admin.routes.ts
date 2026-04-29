// Admin Router Module
// Defines endpoints for admin level routes
// Routes incoming requests to specialized controllers for admin dash-board controle
//
import { Router } from 'express';
import { adminCtr } from '../controller/admin.controller.js';
import multer from 'multer';

// Initialize Multer with memory storage to handle file buffers before processing
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const adminRouter = Router();

// admin route
adminRouter.post('/upload', upload.any(), adminCtr.uploadAsset);
