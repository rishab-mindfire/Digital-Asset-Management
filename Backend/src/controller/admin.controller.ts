// src/controllers/asset.controller.ts
import { Request, Response } from 'express';

class AdminClass {
  uploadAsset = async (req: Request, res: Response) => {
    try {
      console.log(req);
      // Validate file existence
      // if (!req.file) {
      //   return res.status(400).json({ message: 'No file uploaded' });
      // }
      //validation by joi

      // Extract user info
      const userDetails = {};

      //send file request after
    } catch (error) {
      return res.status(500).json({ message: 'Upload failed', error });
    }
  };
}
export const adminCtr = new AdminClass();
