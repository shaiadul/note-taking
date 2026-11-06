import { Response } from "express";
import { IPaginatedResult } from "../types/pagination.interface";

export abstract class BaseController {
  protected sendSuccess<T>(res: Response, data: T, message: string = "Success", statusCode: number = 200): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  protected sendCreated<T>(res: Response, data: T, message: string = "Created"): Response {
    return this.sendSuccess(res, data, message, 201);
  }

  protected sendPaginated<T>(
    res: Response,
    result: IPaginatedResult<T>,
    message: string = "Retrieved successfully"
  ): Response {
    return res.status(200).json({
      success: true,
      message,
      data: result.data,
      pagination: result.pagination
    });
  }

  protected sendNoContent(res: Response): Response {
    return res.status(204).send();
  }
}

