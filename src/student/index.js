import { makeStudentModel } from "./student.models";
import { StudentController } from "./student.controller";
import makeStudentService from "./student.service";

const studentModel = makeStudentModel();
const studentService = makeStudentService(studentModel, {});
const studentController = new StudentController(studentService);

export default studentController;