import { Request, Response } from 'express';

class ManagerClase {
  // check user
  checkRole = async (req: Request, res: Response) => {
    // Fetch user role (for RBAC)
    console.log(req.userEmail);
    res.status(200).json({ message: req.userEmail });
  };
}

export const ManagerCtr = new ManagerClase();
