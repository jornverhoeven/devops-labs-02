import { StatusCodes } from "http-status-codes";
import { HttpError } from "./HttpError";

export class ConflictHttpError extends HttpError {
    constructor(message, description) {
        super(message, StatusCodes.CONFLICT, description);
        Object.setPrototypeOf(this, ConflictHttpError.prototype);
    }
}