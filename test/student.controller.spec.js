import express from "express";
import request from "supertest";
import faker from "faker";
import { fakeStudent } from "./utils";
import { StudentController } from "../src/student/student.controller";
import { makeStudentModel } from "../src/student/student.models";
import makeStudentService from "../src/student/student.service";
import bodyParser from "body-parser";

const studentModel = makeStudentModel();
const studentService = makeStudentService(studentModel, { useStore: false });
const studentController = new StudentController(studentService)
studentController.initialize();

const app = express();
app.use(bodyParser.json());
app.use(studentController.getRouter());

describe("StudentController - GET /student", () => {
    beforeAll(async () => {
        studentModel.init([]);
    })

    it('responds with an empty list', (done) => {
        request(app)
            .get('/student')
            .expect(200, (err, res) => {
                if (err) return done(err)
                expect(res.body).toEqual([]);
                done();
            });
    })

    it('responds with a list', (done) => {
        const students = [fakeStudent(), fakeStudent()];
        studentModel.init(students);

        request(app)
            .get('/student')
            .expect(200, (err, res) => {
                if (err) return done(err)
                expect(res.body).toEqual(students);
                done();
            });
    })
})

describe("StudentController - POST /student", () => {
    beforeEach(async () => {
        studentModel.init([]);
    })

    it('can add a student', (done) => {
        const student = fakeStudent();

        request(app)
            .post('/student')
            .send(student)
            .expect(200, student)
            .end(async (err, res) => {
                if (err) return done(err)
                expect(await studentModel.findById(res.body.student_id)).toEqual(student);
                done();
            });
    })

    it('gives a 400 on invalid student body', (done) => {
        request(app) 
            .post('/student')
            .send({
                some_extra: 'asd',
                first_name: 12,
            })
            .expect(400)
            .end(async (err, res) => {
                if (err) return done(err)
                expect(await studentModel.find()).toHaveLength(0);
                done();
            });
    })

    it('gives a 409 on conflicting ids', (done) => {
        const student = fakeStudent();
        studentModel.init([student]);

        request(app)
            .post('/student')
            .send(student)
            .expect(409)
            .end(async (err, res) => {
                if (err) return done(err)
                expect(await studentModel.find(s => s.student_id === student.student_id)).toHaveLength(1);
                done();
            });
    })
})

describe("StudentController - GET /student/:id", () => {
    beforeEach(async () => {
        studentModel.init([]);
    })

    it('can get a single existing student', async (done) => {
        const student = fakeStudent();
        studentModel.init([student]);

        request(app)
            .get(`/student/${student.student_id}`)
            .expect(200, student)
            .end(done)
    })

    it('gives a 400 on an invalid student id', async (done) => {
        const student = fakeStudent(); 
        studentModel.init([student]);

        request(app)
            .get(`/student/some-id`)
            .expect(400)
            .end(done)
    });

    it('gives a 404 on a non existing student id', async (done) => {
        const student = fakeStudent();
        studentModel.init([student]);

        request(app)
            .get(`/student/${student.student_id+1}`)
            .expect(404)
            .end(done)
    });
})

describe("StudentController - PUT /student/:id", () => {
    beforeEach(async () => {
        studentModel.init([]);
    })

    it('can update a student', (done) => {
        const student = fakeStudent();
        studentModel.init([student]);

        const updated = {
            ...student,
            first_name: faker.name.firstName(),
            last_name: faker.name.lastName()
        }

        request(app)
            .put(`/student/${student.student_id}`)
            .send(updated)
            .expect(200, updated)
            .end(async (err, res) => {
                if (err) return done(err)
                expect(await studentModel.findById(res.body.student_id)).toEqual(updated);
                done();
            });
    })

    it('gives a 400 on invalid student body', (done) => {
        const student = fakeStudent();
        studentModel.init([student]);

        request(app) 
            .put(`/student/${student.student_id}`)
            .send({
                some_extra: 'asd',
                first_name: 12,
            })
            .expect(400)
            .end(async (err, res) => {
                if (err) return done(err)
                expect(await studentModel.find()).toHaveLength(1);
                done();
            });
    })

    it('gives a 404 on non existing student id', (done) => {
        const student = fakeStudent();
        studentModel.init([student]);

        request(app)
            .put(`/student/${student.student_id + 1}`)
            .send(student)
            .expect(404)
            .end(done);
    })
})

describe("StudentController - DELETE /student/:id", () => {
    beforeEach(async () => {
        studentModel.init([]);
    })

    it('can delete a student', (done) => {
        const student = fakeStudent();
        studentModel.init([student])

        request(app)
            .delete(`/student/${student.student_id}`)
            .expect(200)
            .end(async (err, res) => {
                if (err) return done(err)
                studentModel.findById(student.student_id)
                    .then(() => done('should\'ve thrown an error'))
                    .catch(() => done())
            });
    })

    it('gives a 400 on an invalid student id', (done) => {
        request(app)
            .delete(`/student/some-id`)
            .expect(400)
            .end(done);
    })

    it('gives a 404 on a non existing student id', async (done) => {
        const student = fakeStudent();
        studentModel.init([student]);

        request(app)
            .get(`/student/${student.student_id+1}`)
            .expect(404)
            .end(done)
    });
})