// config/db.ts
import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';
import { handleGlobalError, AppError } from '../utils/globleError.js';
import { logger } from '../utils/logger.js';

dotenv.config();

// Configuration for database resilience
const options: ConnectOptions = {
  autoIndex: true,
  socketTimeoutMS: 45000,
};

/**
 * Establishes a connection to the MongoDB instance.
 * @returns {Promise<typeof mongoose>} The Mongoose instance.
 */
const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const connectionString = process.env.DB_CONNECTION_STRING;
    if (!connectionString) {
      throw new AppError('DB_CONNECTION_STRING is missing in environment variables', 500);
    }

    // Attempt to establish connection with defined options
    mongoose.set('strictQuery', true);
    await mongoose.connect(connectionString, options);
    logger.info(`Db connected ${connectionString}`);

    return mongoose;
  } catch (error: unknown) {
    // Delegate to global handler for consistent error formatting
    return handleGlobalError(`error in db connection :${error}`);
  }
};

export default connectDB;
