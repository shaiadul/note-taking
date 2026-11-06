import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export const httpLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const latencyMs = Number(end - start) / 1_000_000;
    const formattedLatency = `${latencyMs.toFixed(1)}ms`;
    const api = `${req.method} ${req.originalUrl || req.url}`;
    const status = res.statusCode;

    const message = `${api} ${status} in ${formattedLatency}`;

    if (status >= 500) {
      logger.error(message);
    } else if (status >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  });

  next();
};
