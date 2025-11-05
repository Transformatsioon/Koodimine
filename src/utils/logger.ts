import winston from 'winston';

export class Logger {
  private logger: winston.Logger;

  constructor(private context: string) {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          let log = `${timestamp} [${level.toUpperCase()}] [${context}]: ${message}`;
          if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
          }
          return log;
        })
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              return `${timestamp} ${level}: ${message}`;
            })
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    });
  }

  info(message: string, ...meta: any[]): void {
    this.logger.info(message, { context: this.context, ...meta });
  }

  warn(message: string, ...meta: any[]): void {
    this.logger.warn(message, { context: this.context, ...meta });
  }

  error(message: string, error?: any): void {
    this.logger.error(message, { context: this.context, error });
  }

  debug(message: string, ...meta: any[]): void {
    this.logger.debug(message, { context: this.context, ...meta });
  }
}
