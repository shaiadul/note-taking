import { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error";
import { env } from "../config/env.config";
import { logger } from "../utils/logger";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {})
    });
    return;
  }

  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: `Invalid format for field: ${err.path}`
    });
    return;
  }

  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: "Database validation error",
      details: Object.values(err.errors).map((e: any) => e.message)
    });
    return;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    res.status(409).json({
      success: false,
      message: `Duplicate value entered for ${field}`
    });
    return;
  }

  logger.error({ err }, "Unhandled application error");

  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(env.NODE_ENV === "development" ? { stack: err.stack } : {})
  });
};

