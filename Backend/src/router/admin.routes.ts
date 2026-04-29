// Admin Router Module
// Defines endpoints for admin level routes
// Routes incoming requests to specialized controllers for admin dash-board
//
import { Router } from 'express';
import { AdminCtr } from '../controller/admin.controller.js';

export const adminRouter = Router();

// admin route
adminRouter.get('/home', AdminCtr.checkRole);
