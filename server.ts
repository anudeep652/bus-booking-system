import type { Request, Response } from "express";
import express from "express";
import dotenv from "dotenv";
//@ts-ignore
import expressSanitizer from "express-sanitizer";
import path from "path";
import fs from "fs";
import userRoutes from "./routes/userRoutes";
import operatorRoutes from "./routes/operatorRoutes";
import busRoutes from "./routes/busRoutes";
import adminRoutes from "./routes/adminRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import tripRoutes from "./routes/tripRoutes";

import { logger } from "./services/LoggingService";
import { database } from "./services/DatabaseService";

import { rateLimit } from "express-rate-limit";
import cors from "cors";

dotenv.config({ path: path.join(path.resolve(), "./.env.development") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);

if (process.env.ENABLE_RATE_LIMITER === "true") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later.",
  });

  app.use(limiter);
}

app.use(logger.requestLogger);
app.use(expressSanitizer());
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        // @ts-ignore
        req.body[key] = req.sanitize(req.body[key]);
      }
    }
  }
  next();
});

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/operator", operatorRoutes);
app.use("/api/v1/bus", busRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/booking", bookingRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/trip", tripRoutes);

//serve docs
if (
  process.env.NODE_ENV === "development" &&
  process.env.SERVE_DOCS === "true"
) {
  const marked = require("marked");
  app.get("/api/v1/docs/:path*", async (req: Request, res: Response) => {
    console.log(req.params);
    const docPath = path.join(
      path.resolve(),
      "docs",
      req.params.path + (req.params[0] || "")
    );

    try {
      const markdown = fs.readFileSync(docPath + ".md", "utf-8");
      const html = marked(markdown);
      res.send(`
          <!DOCTYPE html>
          <html>
          <head>
              <title>API Documentation</title>
              <style>
                body { font-family: sans-serif; padding: 20px; }
              </style>
          </head>
          <body>
              ${html}
          </body>
          </html>
      `);
    } catch (err) {
      console.error(err);
      res.status(404).send("Documentation not found.");
    }
  });
}

async function startServer() {
  try {
    await database.connect();
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  logger.info("SIGINT received. Shutting down gracefully...");
  try {
    await database.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown", { error });
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  try {
    await database.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown", { error });
    process.exit(1);
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to the Bus Booking API");
});

app.use(logger.errorHandler);

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

startServer();
