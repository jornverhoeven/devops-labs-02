import { Request } from "express";

export class HttpError extends Error {
    /**
     * 
     * @param {string} message 
     * @param {number} statusCode 
     * @param {string?} description 
     */
    constructor(message, statusCode, description) {
        super();
        this.message = message;
        this.statusCode = statusCode;
        this.description = description;
        Object.setPrototypeOf(this, HttpError.prototype);
    }

    /**
     * 
     * @param {Request} request 
     */
    toRequestJson(request) {
        return {
            error: {
                code: this.statusCode,
                message: this.message,
                description: this.description,
                path: request.originalUrl,
                method: request.method
            }
        }
    }
}