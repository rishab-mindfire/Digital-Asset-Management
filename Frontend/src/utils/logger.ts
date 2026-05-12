//log type level
type LogLevel = 'info' | 'warn' | 'error';
// structure log for server
export const logToServer = async (level: LogLevel, message: string, data?: unknown) => {
  try {
    const url = `${import.meta.env.VITE_BASE_URL}/api/logs`;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level,
        message,
        meta: data, // JSON.stringify handles strings, arrays, and objects correctly
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    // Basic console warning if the logging service itself is unreachable
    logger.warn('Remote log failed', err);
  }
};

//function for logging
export const logger = {
  info: (msg: string, data?: unknown) => {
    // logToServer('info', msg, data);
  },
  warn: (msg: string, data?: unknown) => {
    // logToServer('warn', msg, data);
  },
  error: (msg: string, data?: unknown) => {
    // logToServer('error', msg, data);
  },
};
