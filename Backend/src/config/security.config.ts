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
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Disposition'],
};

// helmet for CSP (cross security policy) and x-frame
export const configureSecurity = (app: Express): void => {
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // use the URL directly in the <video> tag,
      // allow cross-origin-embedder-policy
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        // Add frontend URL to connect-src so the browser allows the request
        connectSrc: ["'self'", frontend_url],
        scriptSrc: ["'self'", frontend_url],
      },
    }),
  );

  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(helmet.xssFilter());
};
