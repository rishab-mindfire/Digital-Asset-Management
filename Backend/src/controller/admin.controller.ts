import { Request, Response } from 'express';
import { getUserDetails } from '../services/authRole.service.js';
import { adminServices } from '../services/admin.service.js';
import { uploadAssetSchema } from '../validation/upload.validation.js';
import { isQueueReachable } from '../helper/rabitMq.js';

class AdminClass {
  uploadAsset = async (req: Request, res: Response) => {
    try {
      if (!req.userEmail) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      // Joi validation for the body
      const { error, value } = uploadAssetSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const userDetails = await getUserDetails(req.userEmail);

      // CHECK for running rabit mq ---
      const rabbitMQ = await isQueueReachable();
      if (!rabbitMQ) {
        return res
          .status(500)
          .json({ message: 'Upload Service is currently unavailable: Message Queue is down.' });
      }

      // Pass the array of buffers to the service
      if (userDetails && rabbitMQ) {
        const assets = await adminServices.uploadAsset(files, value, {
          userID: userDetails.userID,
          userEmail: req.userEmail,
        });

        return res.status(202).json({
          message: `${assets.length} assets are being processed.`,
          assets,
        });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Upload failed', error: error });
    }
  };
}

export const adminCtr = new AdminClass();
