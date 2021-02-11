import { StatusCodes } from "http-status-codes";
import { HttpError } from "./HttpError";

export class InternalServerErrorHttpError extends HttpError {
    constructor(message, description) {
        super(message, StatusCodes.INTERNAL_SERVER_ERROR, description);
        Object.setPrototypeOf(this, InternalServerErrorHttpError.prototype);
    }
}