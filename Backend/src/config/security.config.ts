/* eslint-disable quotes */
import helmet from 'helmet';
import { CorsOptions } from 'cors';
import { Express } from 'express';

const frontend_url: string = process.env.FRONTEND_URL || 'http://localhost:3001';

// CORS policy
export const corsOptions: CorsOptions = {
  origin: [frontend_url],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization', 'Content-Disposition'],
};

// helmet for CSP (cross security policy) and x-frame
export const configureSecurity = (app: Express): void => {
  app.use(helmet());
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", frontend_url],
      },
    }),
  );
  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(helmet.xssFilter());
};
