import { ValidationError } from "../errors";
import { simpleLogger } from "../utils";
import requiredField from "../utils/requiredField";

export function makeStudent(studentInfo, options = {}) {
    const { logger = simpleLogger() } = options; 

    const validStudent = validate(studentInfo);
    const normalizedStudent = normalize(validStudent);
    return Object.freeze(normalizedStudent);

    function validate(student) {
        const { 
            first_name = requiredField('first_name'),
            last_name = requiredField('last_name'),
            grades, // = requiredField('grades'),
            student_id,
            ...rest
        } = student;

        if (student_id && (typeof student_id !== 'number' || !Number.isInteger(student_id)))
            throw new ValidationError('student_id', `'student_id' must be an integer`);
        if (typeof first_name !== 'string')
            throw new ValidationError('first_name', `'first_name' must be a string`);
        if (typeof last_name !== 'string')
            throw new ValidationError('last_name',`'last_name' must be a string`);
        if (grades && typeof grades !== 'object') 
            throw new ValidationError('grades', `'grades' must be a map`);
        // TODO: Consider checking type of all keys and values

        if (rest === 'undefined' || Object.keys(rest).length !== 0) {
            logger.warn('student object contained additional information, ignoring', rest);
        }

        return {
            student_id,
            first_name,
            last_name,
            grades
        };
    }

    function normalize(student) {
        return student;
    }
}

export function makeStudentModel(options = {}) {
    const { logger = simpleLogger() } = options; 
    let store = [];

    return Object.freeze({
        init,
        find,
        findOne,
        findById,
        create,
        update,
        delete: _delete
    })

    function init(students) {
        store = students;
    }

    function find(predicate) {
        return new Promise((resolve) => {
            if (!predicate) resolve(store);
            else resolve(store.filter(predicate));
        });
    }

    function findOne(predicate) {
        return new Promise((resolve, reject) => {
            const student = store.find(predicate);
            if (!student) reject(new Error('not_found'));
            else resolve(student);
        });
    }

    function findById(id) {
        return findOne(s => s.student_id === id);
    }

    async function create(student) {
        const exists = store.find(s => 
            s.first_name === student.first_name 
            || s.last_name === student.last_name);
        if (exists) throw new Error(`student already exists`);

        if (!student.student_id) {
            const s = {
                ...student,
                student_id: getNewId()
            };
            store.push(s);
            return Promise.resolve(s);
        }

        const index = store.findIndex(s => s.student_id === student.student_id);
        if (index !== -1) throw new Error(`student with id '${student.student_id}' already exists`);

        store.push(student);
        return Promise.resolve(student);
    }

    function update(id, student) {
        const index = store.findIndex(s => s.student_id === id);
        if (index === -1) return Promise.reject(new Error('not_found'));
        store[index] = student;
        return Promise.resolve(store[index]);
    }

    function _delete(id) {
        const index = store.findIndex(s => s.student_id === id);
        if (index === -1) return Promise.reject(new Error('not_found'));
        delete store[index];
        store = store.filter(Boolean);
        return Promise.resolve();
    }

    function getNewId() {
        const ids = store.map(s => s.student_id).sort((a, b) => a-b);
        return (ids[ids.length - 1] || 0)+1;
    }
}