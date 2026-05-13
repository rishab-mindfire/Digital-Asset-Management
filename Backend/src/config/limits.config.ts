import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

// normal rate limmiter
export const globalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, //15 mint
  max: 1000 * 10000000, // for testing * 1000000
  message: 'Too many requests, please try again later.',
});
// log limiter
export const logLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Log limit exceeded for this IP.',
  standardHeaders: true,
  legacyHeaders: false,
});
