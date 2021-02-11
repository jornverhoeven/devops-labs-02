import faker from "faker";
import { makeStudent } from "../src/student/student.models";

export function fakeStudent() {
    const grades = {};
    grades[faker.random.word()] = faker.random.number();

    return makeStudent({
        student_id: faker.random.number(),
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        grades
    });
}