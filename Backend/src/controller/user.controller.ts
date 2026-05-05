import { Request, Response } from 'express';
import { userServices } from '../services/users.service.js';
import { generateToken } from '../services/authGeneral.service.js';
import { UsersModel } from '../models/users.model.js';
import { verifyEmplyeeRole } from '../services/authRole.service.js';
import { userLoginValidation, userRegistrationValidation } from '../validation/user.validation.js';

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

      return res.status(201).json({ message: 'User created successfully!' });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json({
          message: 'Internal server error. User could not be created.',
          error: err.message,
        });
      }
    }
  };

  // login user
  userLogin = async (req: Request, res: Response) => {
    // Check for empty request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Request body is missing or empty' });
    }

    // Validate login request
    const { error, value } = userLoginValidation.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        details: error.details[0].message.replace(/"/g, ''),
      });
    }

    const { userEmail, userPassword } = value;

    try {
      // Verify user credentials
      const checkPassword = await userServices.checkSigninPassword(userEmail, userPassword);

      if (!checkPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const JWTtoken = generateToken({ userEmail });

      // Fetch user role (for RBAC)
      const userRole = await verifyEmplyeeRole(userEmail);

      // Attach token in response header
      res.setHeader('Authorization', 'Bearer ' + JWTtoken);

      return res.status(200).json({
        message: 'Login successful',
        userRole: userRole,
      });
    } catch {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  // change password
  userChangePassword = async (req: Request, res: Response) => {
    // Find user by email
    const user = await UsersModel.findOne({ userEmail: req.body.userEmail });

    if (user) {
      res.status(200).send(user);
    } else {
      res.status(404).send('Email not found !');
    }
  };
}

export const UserCtr = new UserClass();
