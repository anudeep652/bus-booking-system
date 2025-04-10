import type { Request, Response, NextFunction } from "express";
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
        winston.format.json()
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
            winston.format.simple()
          ),
        })
      );
    }
  }

  public requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
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

  public errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
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
    this.logger.error(
      typeof message !== "string" ? JSON.stringify(message) : message,
      ...meta
    );
  }

  public warn(message: string | object, ...meta: any[]): void {
    this.logger.warn(
      typeof message !== "string" ? JSON.stringify(message) : message,
      ...meta
    );
  }

  public info(message: string | object, ...meta: any[]): void {
    this.logger.info(
      typeof message !== "string" ? JSON.stringify(message) : message,
      ...meta
    );
  }

  public http(message: string | object, ...meta: any[]): void {
    this.logger.http(
      typeof message !== "string" ? JSON.stringify(message) : message,
      ...meta
    );
  }

  public verbose(message: string | object, ...meta: any[]): void {
    this.logger.verbose(
      typeof message !== "string" ? JSON.stringify(message) : message,
      ...meta
    );
  }

  public debug(message: string | object, ...meta: any[]): void {
    this.logger.debug(
      typeof message !== "string" ? JSON.stringify(message) : message,
      ...meta
    );
  }

  public silly(message: string | object, ...meta: any[]): void {
    this.logger.silly(
      typeof message !== "string" ? JSON.stringify(message) : message,
      ...meta
    );
  }
}

export const logger = new LoggingService();
