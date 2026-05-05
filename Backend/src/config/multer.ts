// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { Request } from 'express';

// const UPLOAD_DIR = './storage/raw';

// // Ensure directory exists
// if (!fs.existsSync(UPLOAD_DIR)) {
//   fs.mkdirSync(UPLOAD_DIR, { recursive: true });
// }

// const storage = multer.diskStorage({
//   // Use _req to ignore the unused parameter error
//   destination: (_req: Request, _file: Express.Multer.File, cb) => {
//     cb(null, UPLOAD_DIR);
//   },
//   filename: (_req: Request, file: Express.Multer.File, cb) => {
//     // Unique name: 1714392000000-123456789.png
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// export const uploadMiddleware = multer({
//   storage,
//   limits: {
//     fileSize: 50 * 1024 * 1024, // 50MB limit
//   },
// });
