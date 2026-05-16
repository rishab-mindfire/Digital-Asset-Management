import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.dev';

dotenv.config({ path: envFile });

import app from './index.js';
import connectDB from './config/connectDB.config.js';
import { initWorkers } from './consumers/index.js';
import { logger } from './utils/logger.js';

const port = process.env.PORT || 4001;

const startServer = async () => {
  try {
    // connection DB
    try {
      await connectDB();
    } catch (error) {
      logger.error(`error in db connection : ${error}`);
    }
    //workers conection (consumner) to MQ
    try {
      await initWorkers();
      logger.info('Worker initiated !');
    } catch (error) {
      logger.error(`error in Worker creation : ${error}`);
    }
    app.listen(port, () => {});
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
  }
};

startServer();
