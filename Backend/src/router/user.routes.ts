// User Authentication Router Module
// Defines endpoints for identity management and account security operations
// Routes incoming requests to specialized controllers for registration and login
// Facilitates secure credential updates through the password reset endpoint
import { Router } from 'express';
import { UserCtr } from '../controller/user.controller.js';

export const userRouter = Router();

// user route
userRouter.post('/register', UserCtr.userRegistration);
userRouter.post('/login', UserCtr.userLogin);
userRouter.post('/reset', UserCtr.userChangePassword);
