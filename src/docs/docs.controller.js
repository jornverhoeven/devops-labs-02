import { RestController } from "../controller";
import chalk from 'chalk';
import fs from 'fs';
import YAML from 'yaml';
import swagger from 'swagger-ui-express';

export class DocsController extends RestController {

    constructor(options = {}) {
        super(options);
        this.swaggerFile = options.swaggerFile || './swagger.yaml';
    }

    isApiRoute() { return false; }

    async initialize() {
        this.logger.debug(`Loading swagger doc file ${chalk.underline(this.swaggerFile)}`);
        const file = fs.readFileSync(this.swaggerFile, 'utf-8');
        
        this.router.use('/docs', swagger.serve);
        this.router.get('/docs', swagger.setup(YAML.parse(file)));
    }
}