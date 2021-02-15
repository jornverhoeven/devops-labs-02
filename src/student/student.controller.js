import { RestController } from "../controller";
import { ValidationError } from "../errors";
import { BadRequestHttpError, ConflictHttpError, NotFoundHttpError, MethodNotAllowedHttpError } from "../errors/http";
import handleRequest from "../utils/handleRequest";
import requiredField from "../utils/requiredField";
import { makeStudent } from "./student.models";

export class StudentController extends RestController {

    constructor(studentService, options = {}) {
        super(options);
        this.studentService = studentService;
    }

    async initialize() {
        this.studentService.init();
        this.router.route('/student')
            .get(handleRequest(this.getAll.bind(this)))
            .post(handleRequest(this.create.bind(this)));
        this.router.route('/student/:id')
            .get(handleRequest(this.get.bind(this)))
            .put(handleRequest(this.update.bind(this)))
            .delete(handleRequest(this.delete.bind(this)));
    }

    async start() {
    }

    async close() {
        return this.studentService.store();
    }

    async getAll(req) {
        const { subject, first_name, last_name } = req.query;

        const predicates = [];
        if (subject) predicates.push(s => subject in s.grades);
        if (first_name) predicates.push(s => s.first_name === first_name);
        if (last_name) predicates.push(s => s.last_name === last_name);

        return {
            data: (await this.studentService.getAll(s => predicates.every(p => p(s))))[0]
        };
    }

    async get(req) {
        const { id = requiredField('id') } = req.params;
        const { subject } = req.query;


        if (typeof id === 'string' && !Number.isInteger(parseInt(id)))
            throw new BadRequestHttpError('invalid_id', 'Invalid ID supplied');

        const predicates = [];
        predicates.push(s => s.student_id === parseInt(id));
        if (subject) predicates.push(s => subject in s.grades);


        try {
            const student = (await this.studentService.getAll(s => predicates.every(p => p(s))))[0];
            if (!student) throw new Error('not_found');
            return {
                data: student
            };
        } catch (e) {
            if (e.message === 'not_found')
                throw new NotFoundHttpError('not_found', `No student found with id '${id}'`)
            throw e;
        }
    }

    async create(req) {
        const { body = requiredField('body') } = req;
        try {
            const student = makeStudent(body);
            const data = await this.studentService.create(student);
            return { data: data['student_id'] };
        } catch (e) {
            if (e.message.startsWith('student with id') || e.message === 'student already exists')
                throw new ConflictHttpError(e.message, e.description);
            if (e instanceof ValidationError)
                throw new MethodNotAllowedHttpError('invalid_student_body', e.message);
            throw e;
        }
    }

    async update(req) {
        const { id = requiredField('id') } = req.params;
        const { body = requiredField('body') } = req;

        if (typeof id === 'string' && !Number.isInteger(parseInt(id)))
            throw new BadRequestHttpError('invalid_id', 'Invalid ID supplied');

        try {
            const student = makeStudent(body);
            return {
                data: await this.studentService.update(id, student)
            };
        } catch (e) {
            if (e.message.startsWith('not_found'))
                throw new NotFoundHttpError(e.message, e.description);
            if (e instanceof ValidationError)
                throw new BadRequestHttpError('invalid_student_body', e.message);
            throw e;
        }
    }

    async delete(req) {
        const { id = requiredField('id') } = req.params;

        if (typeof id === 'string' && !Number.isInteger(parseInt(id)))
            throw new BadRequestHttpError('invalid_id', 'Invalid ID supplied');

        try {
            const data = await this.studentService.delete(parseInt(id));
            return { data };
        } catch (e) {
            if (e.message === 'not_found')
                throw new NotFoundHttpError(e.message, e.description);
            throw e;
        }
    }
}