import pinoHttp from "pino-http";
import crypto from "crypto";
import { logger } from "../utils/logger";

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => (req.headers["x-request-id"] as string) || crypto.randomUUID(),
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  redact: ["req.headers.authorization", "req.headers.cookie"]
});

