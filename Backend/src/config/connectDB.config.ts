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
  console.log(process.env.DB_CONNECTION_STRING);
  if (!connectionString) {
    console.error('No DB_CONNECTION_STRING found in environment');
    return;
  }

  try {
    await mongoose.connect(connectionString, options);
    return mongoose;
  } catch (err) {
    console.error('Mongoose connection error:', err);
    throw err;
  }
};

export default connectDB;
