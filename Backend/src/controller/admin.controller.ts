// src/controllers/asset.controller.ts
import { Request, Response } from 'express';

export const uploadAsset = async (req: Request, res: Response) => {
  try {
    // Validate file existence
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Extract user info auth varification

    //send file request after validation
  } catch (error) {
    return res.status(500).json({ message: 'Upload failed', error });
  }
};
