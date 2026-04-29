import { determineFileType } from "../helper/filemetadata.js";
import { AssetModel } from "../models/asset.model.js";
import { publishToQueue } from "./producer.service.js";

class AminServices {
  // upload files
  async uploadAsset(req: ):Promise<void> {
    try {
      // collect file data
      // Create the Database Record
    const asset = await AssetModel.create({
      title: req.body.title || req.file.originalname,
      fileType: determineFileType(req.file.mimetype),
      localPath: req.file.path, // Points to ./storage/raw/filename
      ownerID: req._id,
      ownerEmail: req.userEmail,
      status: 'pending',
      metadata: {
        extension: req.file.originalname.split('.').pop(),
        size: req.file.size,
      },
    });

    //  Send Task to RabbitMQ
    await publishToQueue('asset_processing', {
      assetId: asset._id,
      filePath: asset.localPath,
      fileType: asset.fileType,
    });

    // Success Response
    // return res.status(202).json({
    //   message: 'Asset uploaded successfully. Processing started.',
    //   assetId: asset._id,
    // });
    console.log(asset);
    } catch (err) {
      if (err) {
        return;
      }
    }
  }

  // List files assets

  // view assets
}

export const adminServices = new AminServices();
