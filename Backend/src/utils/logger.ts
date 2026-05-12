import winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, json, printf, colorize } = winston.format;

// Format for the Console
const consoleFormat = printf(({ level, message, timestamp, meta }) => {
  const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}]: ${message}${metaString}`;
});

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true, // Compresses old files to save space
  maxSize: '20m', // Rotate when file hits 20MB
  maxFiles: '14d', // Keep logs for 14 days
});

export const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json(), // This ensures objects/arrays from frontend stay as JSON in the file
  ),
  transports: [
    transport,
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), consoleFormat),
    }),
  ],
});
