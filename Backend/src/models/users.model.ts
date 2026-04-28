import { model, Schema } from 'mongoose';
import { UserType } from '../types/index.js';

const userSchema = new Schema<UserType>(
  {
    userID: {
      type: String,
      require: true,
      unique: true,
    },
    userName: {
      type: String,
      require: true,
    },
    userEmail: {
      type: String,
      required: true,
      unique: true,
    },
    userPassword: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const UsersModel = model<UserType>('Users', userSchema);
