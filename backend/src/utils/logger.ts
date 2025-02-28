import winston from 'winston';

/**
 * Creates a logger instance with the specified service name
 */
export const createLogger = (service: string) => {
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { service },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
            return `${timestamp} [${service}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
          })
        )
      }),
      // Add file transport for production
      ...(process.env.NODE_ENV === 'production' 
        ? [new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), 
           new winston.transports.File({ filename: 'logs/combined.log' })]
        : [])
    ]
  });

  return {
    info: (message: string, meta: Record<string, any> = {}): void => {
      logger.info(message, meta);
    },
    
    warn: (message: string, meta: Record<string, any> = {}): void => {
      logger.warn(message, meta);
    },
    
    error: (message: string, meta: Record<string, any> = {}): void => {
      logger.error(message, meta);
    },
    
    debug: (message: string, meta: Record<string, any> = {}): void => {
      logger.debug(message, meta);
    }
  };
};