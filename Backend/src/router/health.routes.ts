import { Router } from 'express';
import { healthCheck } from '../controller/health.controller.js';

const healthRouter = Router();

healthRouter.get('/', healthCheck);

export default healthRouter;
