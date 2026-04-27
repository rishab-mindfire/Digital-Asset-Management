import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const options = {
  autoIndex: true, // Automatically build indexes defined in schema
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

// DB connection using connection string
const connectDB = async () => {
  const connectionString = process.env.DB_CONNECTION_STRING;

  // Only connect if connection string exists and env is 'dev'
  if (connectionString && process.env.NODE_ENV === 'dev') {
    await mongoose.connect(connectionString, options).then().catch();

    return mongoose; // Return mongoose instance
  }
};

export default connectDB;
