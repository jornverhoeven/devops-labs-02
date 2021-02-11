import fs from 'fs';
import chalk from 'chalk';
import simpleLogger from "../utils/simpleLogger";

export default function makeStudentService(studentModel, options = {}) {
    const { logger = simpleLogger(), useStore = true } = options;

    return Object.freeze({
        init,
        store,
        getAll,
        get,
        create,
        update,
        delete: _delete
    })

    async function init(options = {}) {
        if (!useStore) return;
        const { storeFile = './students.json' } = options;

        try {
            logger.debug(`Loading students from ${chalk.underline(storeFile)}`);
            const content = fs.readFileSync(storeFile, 'utf-8');
            await studentModel.init(JSON.parse(content));
        } catch (e) {
            logger.warn(`Could not load student store from ${chalk.underline(storeFile)}`)
            logger.error(e);
        }
    }

    async function store(options = {}) {
        if (!useStore) return;
        const { storeFile = './students.json' } = options;

        try {
            logger.debug(`Storing students to ${chalk.underline(storeFile)}`)
            fs.writeFileSync(storeFile, JSON.stringify(await studentModel.find(), null, '  '));
        } catch (e) {
            logger.error(`Could not store student store from '${chalk.yellow(storeFile)}'`)
        }
    }

    async function getAll(predicate) {
        return await studentModel.find(predicate);
    }

    async function get(idOrPredicate) {
        if (typeof idOrPredicate === 'number') {
            return await studentModel.findById(idOrPredicate);
        } else if (typeof idOrPredicate === 'string') {
            return await studentModel.findById(parseInt(idOrPredicate));
        } else if (typeof idOrPredicate === 'function') {
            return await studentModel.findOne(idOrPredicate);
        }
    }

    async function create(student) {
        return await studentModel.create(student);
    }

    async function update(id, student) {
        return await studentModel.update(parseInt(id), student);
    }

    async function _delete(id) {
        return await studentModel.delete(parseInt(id));
    }
}