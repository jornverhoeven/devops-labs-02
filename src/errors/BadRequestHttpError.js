import { StatusCodes } from "http-status-codes";
import { HttpError } from "./HttpError";

export class BadRequestHttpError extends HttpError {
    constructor(message, description) {
        super(message, StatusCodes.BAD_REQUEST, description);
        Object.setPrototypeOf(this, BadRequestHttpError.prototype);
    }
}