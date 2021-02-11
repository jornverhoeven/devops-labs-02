import { Express, Request, Response, NextFunction, request } from "express";
import { Controller, RestController } from "./controller";
import simpleLogger from "./utils/simpleLogger";
import { yellow, underline } from "chalk";
import bodyParser from "body-parser";
import { HttpError, InternalServerErrorHttpError, MethodNotAllowedHttpError } from "./errors";
import onFinished from "on-finished";

export class Application {

    /**
     * 
     * @param {Express} server
     * @param {Controller[]} controllers 
     * @param {*} options 
     */
    constructor(server, controllers = [], options = {}) {
        const { logger = simpleLogger(), errorHandler } = options;
        this.server = server;
        this.controllers = controllers;
        this.logger = logger;
        this.errorHandler = errorHandler;
    }

    async start() {
        this.logger.info('Starting application');
        const startTime = new Date();

        this.logger.debug('Registering process events');
        this._registerProcessEvents();

        // Setup whatever prerequisites are needed for express.
        // Like registering morgan, and other middleware
        this.logger.debug('Initializing server');
        this.server.use(bodyParser.json());
        this.server.use((req, res, next) => {
            const log = function() {
                this.http(`${req.method} ${underline(req.originalUrl)} ${res.statusCode} ${res.getHeader('Content-Length')}`);
            }
            onFinished(req, log.bind(this.logger));
            next();
        })

        if (this.controllers.length > 0) {
            this.logger.debug(`Initializing controllers (${this.controllers.length})`);
            await this._initializeControllers();

            this.logger.debug(`Starting controllers (${this.controllers.length})`);
            await this._startControllers();
        }

        // Continue with post setup steps for express. 
        // Like the error handling middleware etc.
        this.server.use('/', (_, res) => res.status(200).send());
        this.server.use('*', (_, __, next) => next(new MethodNotAllowedHttpError("unknown_endpoint", "API-endpoint not found")));
        this.server.use(this.httpErrorHandler.bind(this));

        this.logger.debug('Starting server');
        const port = 3000;
        const host = `http://localhost:${port}`;
        this.serverInstance = this.server.listen(port);
        this.logger.debug(`Server started and listening on ${underline(host)}`);
        this.logger.info(`Successfully started the server (${Math.round(new Date - startTime)}ms)`);
    }

    stop() {
        return this._onExit();
    }

    async _onExit(exit = true) {
        if (!exit) return process.exit();

        this.logger.info('Closing application');
        if (this.controllers.length > 0) {
            this.logger.debug('Stopping controllers');
            await this._stopControllers();
        }
        if (this.serverInstance) {
            this.logger.debug('Stopping server');
            this.serverInstance.close();
            this.logger.info('Successfully stopped the server');
        }
        process.exit();
    }

    /**
     * 
     * @param {Error} error 
     */
    _onError(error) {
        if (this.errorHandler)
            return this.errorHandler(error);
        this.logger.error(error);
    }

    _registerProcessEvents() {
        process.on('SIGINT', this._onExit.bind(this));
        process.on('SIGUSR1', this._onExit.bind(this));
        process.on('SIGUSR2', this._onExit.bind(this));
        process.on('exit', () => this._onExit.bind(this)(false));

        process.on('uncaughtException', this._onError.bind(this));
        process.on('unhandledRejection', this._onError.bind(this));
    }

    async _initializeControllers() {
        const initializeController = async (controller) => {
            const name = controller.constructor.name;
            this.logger.debug(`${yellow(name)} Initializing...`)
            return controller.initialize()
                .then(() => {
                    this.logger.info(`${yellow(name)} Successfully initialized`);
                    return { status: 'ok', controller: name };
                })
                .catch((err) => {
                    this.logger.error(`${yellow(name)} Could not be initialized. Error: ${err.toString()}`);
                    return { status: 'error', controller: name, error: err };
                });
        }

        const ps = await Promise.all(this.controllers.map(initializeController));
        return new Promise((resolve, reject) => {
            if (ps.every(({status}) => status === 'ok')) resolve();
            else reject();
        });
    }
    
    async _startControllers() {
        const startController = async (controller) => {
            const name = controller.constructor.name;
            this.logger.debug(`${yellow(name)} Starting...`);

            if (controller instanceof RestController) {
                if (controller.isApiRoute()) {
                    this.server.use('/api', controller.getRouter());
                } else {
                    this.server.use(controller.getRouter());
                }
            }

            return controller.start()
                .then(() => {
                    this.logger.info(`${yellow(name)} Successfully started`);
                    return { status: 'ok', controller: name };
                })
                .catch((err) => {
                    this.logger.error(`${yellow(name)} Could not be started. Error: ${err.toString()}`);
                    return { status: 'error', controller: name, error: err };
                });
        }

        const ps = await Promise.all(this.controllers.map(startController));
        return new Promise((resolve, reject) => {
            if (ps.every(({status}) => status === 'ok')) resolve();
            else reject();
        });
    }

    
    async _stopControllers() {
        const stopController = async (controller) => {
            const name = controller.constructor.name;
            this.logger.debug(`${yellow(name)} Stopping...`)
            return controller.close()
                .then(() => {
                    this.logger.info(`${yellow(name)} Successfully stopped`);
                    return { status: 'ok', controller: name };
                }) 
                .catch((err) => {  
                    this.logger.error(`${yellow(name)} Could not be stopped. Error: ${err.toString()}`);
                    return { status: 'error', controller: name, error: err };
                });
        }

        const ps = await Promise.all(this.controllers.map(stopController));
        return new Promise((resolve, reject) => {
            if (ps.every(({status}) => status === 'ok')) resolve();
            else reject();
        });
    }

    /**
     * 
     * @param {Error} err 
     * @param {Request} req 
     * @param {Response} res 
     * @param {NextFunction} next 
     */
    async httpErrorHandler(err, req, res, next) {
        if (err instanceof HttpError) {
            return res
                .status(err.statusCode)
                .json(err.toRequestJson(req));
        }

        const serverError = new InternalServerErrorHttpError(
            'internal_server_error',
            err.message
        );

        this.logger.error(err.message, err.stack);

        return res
            .status(500)
            .json(serverError.toRequestJson(request));
    }
}
