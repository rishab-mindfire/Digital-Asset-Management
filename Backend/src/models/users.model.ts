import { model, Schema, Document } from 'mongoose';
import { UserType } from '../types/index.js';

// Extending UserType with Mongoose Document properties
export interface IUserDocument extends UserType, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    userID: {
      type: String,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
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
      enum: ['Admin', 'Manager', 'User'],
    },
  },
  { timestamps: true },
);

export const UsersModel = model<IUserDocument>('Users', userSchema);
