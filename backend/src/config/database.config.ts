import mongoose from "mongoose";
import { env } from "./env.config";
import { logger } from "../utils/logger";

export class Database {
  private static instance: Database;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      mongoose.connection.on("connected", () => {
        logger.info("MongoDB connected successfully");
      });

      mongoose.connection.on("error", (error) => {
        logger.error({ error }, "MongoDB connection error");
      });

      mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
      });

      await mongoose.connect(env.MONGO_URI, {
        autoIndex: true
      });
    } catch (error) {
      logger.error({ error }, "Failed to connect to MongoDB");
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");
  }
}
