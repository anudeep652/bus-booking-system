import mongoose from "mongoose";
import { logger } from "./LoggingService";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(path.resolve(), "./.env.development") });

export class DatabaseService {
  private uri: string = process.env.MONGO_URI || "";
  private options: mongoose.ConnectOptions;
  private isConnected: boolean = false;

  constructor(uri?: string, options: mongoose.ConnectOptions = {}) {
    this.uri = uri || process.env.MONGO_URI || "";
    this.options = {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      ...options,
    };

    if (!this.uri) {
      logger.error("MongoDB connection URI is not provided");
      throw new Error("MongoDB connection URI is required");
    }
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info("MongoDB is already connected");
      return;
    }

    try {
      await mongoose.connect(this.uri, this.options);
      this.isConnected = true;
      logger.info("MongoDB connected successfully");

      this.setupConnectionMonitoring();
    } catch (error) {
      const err = error as Error;
      logger.error("MongoDB connection error", {
        message: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }

  /**
   * Close the MongoDB connection
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      logger.info("MongoDB is already disconnected");
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info("MongoDB disconnected successfully");
    } catch (error) {
      const err = error as Error;
      logger.error("MongoDB disconnect error", {
        message: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  public isDbConnected(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Set up event listeners for connection monitoring
   */
  private setupConnectionMonitoring(): void {
    mongoose.connection.on("disconnected", () => {
      this.isConnected = false;
      logger.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      this.isConnected = true;
      logger.info("MongoDB reconnected");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error", {
        message: err.message,
        stack: err.stack,
      });
    });
  }
}

// Export a singleton instance for easy imports across the application
export const database = new DatabaseService();
