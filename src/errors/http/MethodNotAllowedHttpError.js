import { StatusCodes } from "http-status-codes";
import { HttpError } from "./HttpError";

export class MethodNotAllowedHttpError extends HttpError {
    constructor(message, description) {
        super(message, StatusCodes.METHOD_NOT_ALLOWED, description);
        Object.setPrototypeOf(this, MethodNotAllowedHttpError.prototype);
    }
}