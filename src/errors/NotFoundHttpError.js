import { StatusCodes } from "http-status-codes";
import { HttpError } from "./HttpError";

export class NotFoundHttpError extends HttpError {
    constructor(message, description) {
        super(message, StatusCodes.NOT_FOUND, description);
        Object.setPrototypeOf(this, NotFoundHttpError.prototype);
    }
}