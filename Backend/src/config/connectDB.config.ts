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
    return;
  }
  await mongoose.connect(connectionString, options);
  return mongoose;
};

export default connectDB;
