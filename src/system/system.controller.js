import { RestController } from "../controller";
import { handleRequest } from "../utils";

export class SystemController extends RestController {

    constructor(options = {}) {
        super(options);
    }

    async initialize() {
        this.router
            .get('/system/ping', handleRequest(this.ping.bind(this)))
    }

    async ping() {
        return {
            data: {
                systemTime: (new Date()).toISOString(),
                version: process.env.npm_package_version
            }
        }
    }
}