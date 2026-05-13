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
    await connectDB();
    //workers conection (consumner) to MQ
    await initWorkers();
    app.listen(port, () => {});
    logger.info('workers initiated ! ');
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
  }
};

startServer();
