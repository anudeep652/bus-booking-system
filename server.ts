import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.ts";
import operatorRoutes from "./routes/operatorRoutes.ts";
import busRoutes from "./routes/busRoutes.ts";
import adminRoutes from "./routes/adminRoutes.ts";
import bookingRoutes from "./routes/bookingRoutes.ts"

import { logger } from "./services/LoggingService.ts";
import { database } from "./services/DatabaseService.ts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(logger.requestLogger);

// Routes
app.use("/user", userRoutes);
app.use("/operator", operatorRoutes);
app.use("/buses", busRoutes);
app.use("/api/admin", adminRoutes);
app.use("/booking",bookingRoutes)

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
