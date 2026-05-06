import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const options = {
  autoIndex: true,
  socketTimeoutMS: 45000,
};

// DB connection using connection string
const connectDB = async () => {
  const connectionString = process.env.DB_CONNECTION_STRING;
  if (!connectionString) {
    // console.error('No DB_CONNECTION_STRING found in environment');
    return;
  }
  await mongoose.connect(connectionString, options);
  return mongoose;
};

export default connectDB;
