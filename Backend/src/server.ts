import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.dev';

dotenv.config({ path: envFile });

import app from './index.js';
import connectDB from './config/connectDB.config.js';
import { initWorkers } from './workers/index.js';
// import { processMedia } from './workers/media.worker.js';

const port = process.env.PORT || 4001;

const startServer = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully.');
    //processMedia();
    await initWorkers();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
};

startServer();
