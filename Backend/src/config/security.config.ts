/* eslint-disable quotes */
import helmet from 'helmet';
import { CorsOptions } from 'cors';
import { Express } from 'express';

const frontend_url: string = process.env.FRONTEND_URL || 'http://localhost:3001';

export const corsOptions: CorsOptions = {
  origin: [frontend_url],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
  optionsSuccessStatus: 200,
  // HEADERS THE BROWSER IS ALLOWED TO SEND
  allowedHeaders: ['Authorization', 'Content-Type', 'Range', 'X-Requested-With'],
  // HEADERS THE BROWSER IS ALLOWED TO READ FROM THE RESPONSE
  exposedHeaders: [
    'Authorization',
    'Content-Range',
    'Accept-Ranges',
    'Content-Length',
    'Content-Disposition',
  ],
};

// helmet for CSP (cross security policy) and x-frame
export const configureSecurity = (app: Express): void => {
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        // connect-src: Allow XHR/Fetch/Websockets to BOTH frontend and backend
        connectSrc: ["'self'", frontend_url, '://localhost:4001'],
        // script-src: Ensure scripts can run
        scriptSrc: ["'self'", frontend_url, "'unsafe-inline'"],
        // media-src: CRITICAL for <video> tags to work
        mediaSrc: ["'self'", 'http://localhost:4001', 'blob:'],
        // imgSrc: for thumbnails
        imgSrc: ["'self'", 'data:', 'blob:', 'http://localhost:4001'],
      },
    }),
  );

  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(helmet.xssFilter());
};
