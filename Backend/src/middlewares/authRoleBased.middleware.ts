import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { verifyEmplyeeRole } from '../services/authRole.service.js';

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
    } catch (error: any) {
      //  Handle Expired Access Token
      // This 401 signals to call the /refresh endpoint
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Access token expired',
          code: 'TOKEN_EXPIRED',
        });
      }

      // Handle other JWT errors (invalid signature, malformed, etc.)
      return res.status(403).json({ message: 'Invalid session', error: error.message });
    }
  };
}

export default authRoleBased;
