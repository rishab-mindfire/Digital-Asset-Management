import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { verifyEmplyeeRole } from '../services/authRole.service.js';
import { handleControllerError } from '../utils/globleError.js';

function authRoleBased(...allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      //  Extract the Access Token from the Authorization header
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Authentication token missing' });
      }

      //  Verify the Access Token
      const secret = process.env.JWT_SECRET!;
      const decoded = jwt.verify(token, secret) as { userEmail: string };

      //  Authorization Check the user's role
      const userEmail = decoded.userEmail;
      const userRole = await verifyEmplyeeRole(userEmail);

      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
      }

      //  Attach email to request for use in controllers
      req.userEmail = userEmail;
      next();
    } catch (error: unknown) {
      handleControllerError(res, error, 'Invalid session', 401);
    }
  };
}

export default authRoleBased;
