import app from './index.js';
import dotenv from 'dotenv';
import connectDB from './config/connectDB.config.js';
import { processMedia } from './workers/media.worker.js';

dotenv.config();

const port = process.env.PORT || 4001;

const startServer = async () => {
  try {
    //  Database
    await connectDB();
    console.log(' Database connection established');

    // process media worker
    processMedia();

    //  Start Express
    const server = app.listen(port, () => {
      console.log(` Server running in ${process.env.NODE_ENV} mode on port ${port}`);
    });

    // Graceful Shutdown
    const shutdown = () => {
      console.log('Closing HTTP server...');
      server.close(() => {
        console.log('HTTP server closed. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Critical startup failure:', error);
    process.exit(1);
  }
};

startServer();
