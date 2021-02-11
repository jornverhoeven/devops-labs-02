import simpleLogger from "./utils/simpleLogger";
import { Express, Router } from "express";

export class Controller  {
    constructor(options = {}) {
        const { logger = simpleLogger() } = options;
        this.logger = logger;
    }

    /**
     * @returns {Promise}
     */
    async initialize() {

    }

    /**
     * @returns {Promise}
     */
    async start() {

    }

    /**
     * @returns {Promise}
     */
    async close() {
        
    }
}

export class RestController extends Controller {
    constructor(options = {}) {
        super(options);
        this.router = Router();
    }

    getRouter() {
        return this.router;
    }

    isApiRoute() { return true; }
}