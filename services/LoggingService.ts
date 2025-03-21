//@ts-nocheck
import winston from "winston";
import fs from "fs";
import path from "path";

export class LoggingService {
  private logger: winston.Logger;
  private logDir: string;

  constructor(serviceName: string = "bus-booking-api") {
    this.logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      defaultMeta: { service: serviceName },
      transports: [
        new winston.transports.File({
          filename: path.join(this.logDir, "error.log"),
          level: "error",
        }),
        new winston.transports.File({
          filename: path.join(this.logDir, "combined.log"),
        }),
      ],
    });

    if (process.env.NODE_ENV !== "production") {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      );
    }
  }

  public requestLogger = (req, res, next): void => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      this.info({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get("user-agent") || "unknown",
      });
    });

    next();
  };

  public errorHandler = (err: Error, req, res, next): void => {
    this.error({
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      error: "Internal server error",
    });
  };

  public error(message: string | object, ...meta: any[]): void {
    this.logger.error(message, ...meta);
  }

  public warn(message: string | object, ...meta: any[]): void {
    this.logger.warn(message, ...meta);
  }

  public info(message: string | object, ...meta: any[]): void {
    this.logger.info(message, ...meta);
  }

  public http(message: string | object, ...meta: any[]): void {
    this.logger.http(message, ...meta);
  }

  public verbose(message: string | object, ...meta: any[]): void {
    this.logger.verbose(message, ...meta);
  }

  public debug(message: string | object, ...meta: any[]): void {
    this.logger.debug(message, ...meta);
  }

  public silly(message: string | object, ...meta: any[]): void {
    this.logger.silly(message, ...meta);
  }
}

export const logger = new LoggingService();
