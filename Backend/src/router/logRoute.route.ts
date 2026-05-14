import { Router } from 'express';
import { logger } from '../utils/logger.js';

const logRouter = Router();

logRouter.post('/logs', (req, res) => {
  const { level, message, meta, timestamp } = req.body;
  // pass the level dynamically ('info', 'error', etc. with there message)
  logger.log(level || 'info', `[FE] ${message}`, {
    frontendMeta: meta, // This stores  string/object/array
    frontendTime: timestamp,
  });

  res.status(204).send();
});

export default logRouter;
