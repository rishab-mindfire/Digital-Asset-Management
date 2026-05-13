import { Request, Response } from 'express';
import { userServices } from '../services/users.service.js';
import { UsersModel } from '../models/users.model.js';
import { verifyEmplyeeRole } from '../services/authRole.service.js';
import jwt from 'jsonwebtoken';
import { userLoginValidation, userRegistrationValidation } from '../validation/user.validation.js';
import { AppError, handleControllerError } from '../utils/globleError.js';
import { logger } from '../utils/logger.js';

class UserClass {
  // create user
  userRegistration = async (req: Request, res: Response) => {
    try {
      const data = req.body;

      if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ message: 'Provide request body' });
      }

      const { error, value } = userRegistrationValidation.validate(data);
      if (error) {
        return res.status(422).json({ message: error.message.replace(/[\\"]/g, '') });
      }

      const existingUser = await userServices.checkEmail(value.userEmail);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already exists!' });
      }

      // create new user
      await userServices.createUser(value);
      logger.info('user created !');
      return res.status(201).json({ message: 'User created successfully!' });
    } catch (err: unknown) {
      if (err instanceof Error) {
        handleControllerError(res, err, 'Internal server error. User could not be created.', 500);
      }
    }
  };

  // login user
  userLogin = async (req: Request, res: Response) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Request body is missing or empty' });
    }

    const { error, value } = userLoginValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        details: error.details[0].message.replace(/"/g, ''),
      });
    }

    const { userEmail, userPassword } = value;

    try {
      const checkPassword = await userServices.checkSigninPassword(userEmail, userPassword);
      if (!checkPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate both Access and Refresh Tokens
      // Secret for Refresh token
      const accessToken = jwt.sign({ userEmail }, process.env.JWT_SECRET!, { expiresIn: '1d' });
      const DigitalAssetApp = jwt.sign({ userEmail }, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: '7d',
      });

      const userRole = await verifyEmplyeeRole(userEmail);

      //  Set the Refresh Token in a secure HTTP-only cookie
      res.cookie('DigitalAssetApp', DigitalAssetApp, {
        httpOnly: true, // Protects against XSS
        sameSite: 'strict', // Protects against CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      //  Send Access Token in Header and Body
      res.setHeader('Authorization', 'Bearer ' + accessToken);
      logger.info('login success !');
      return res.status(200).json({
        message: 'Login successful',
        userRole: userRole,
        accessToken: accessToken,
      });
    } catch (err: unknown) {
      logger.error(err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  // refresh token
  refreshTokenController = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.DigitalAssetApp;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 401);
    }

    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
        userEmail: string;
      };
      //Check DB to see if user is still active or token is revoked
      const user = await UsersModel.findOne({ userEmail: payload.userEmail });
      if (!user) {
        throw new Error();
      }
      const newAccessToken = jwt.sign({ userEmail: payload.userEmail }, process.env.JWT_SECRET!, {
        expiresIn: '15m',
      });
      //Issue a fresh refresh token (Rotation)
      const newRefreshToken = jwt.sign(
        { userEmail: payload.userEmail },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' },
      );
      res.cookie('DigitalAssetApp', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      logger.error(`Error in sending cookie ${error}`);
      // If verification fails, clear the stale cookie from the client
      res.clearCookie('DigitalAssetApp');
      throw new AppError('Session expired, please login again', 403);
    }
  };
}

export const UserCtr = new UserClass();
