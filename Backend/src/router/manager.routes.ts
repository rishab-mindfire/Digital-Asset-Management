// Manager Router Module
// Defines endpoints for Manager level routes
// Routes incoming requests to specialized controllers for Manager dash-board
//
import { Router } from 'express';
import { ManagerCtr } from '../controller/manager.controller.js';

export const managerRouter = Router();

// admin route
managerRouter.get('/home', ManagerCtr.checkRole);
