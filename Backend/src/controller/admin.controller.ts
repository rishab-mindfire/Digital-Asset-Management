import { Request, Response } from 'express';
import { verifyEmplyeeRole } from '../services/authRole.service.js';

class AdminClase {
  // check user
  checkRole = async (req: Request, res: Response) => {
    // Fetch user role (for RBAC)
    console.log(req.userEmail);
    res.status(200).json({ message: req.userEmail });
  };
}

export const AdminCtr = new AdminClase();
