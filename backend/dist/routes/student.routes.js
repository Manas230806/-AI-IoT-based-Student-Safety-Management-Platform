"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("../controllers/student.controller");
const router = (0, express_1.Router)();
router.get('/', student_controller_1.getStudents);
router.get('/:id', student_controller_1.getStudentById);
router.post('/', student_controller_1.createStudent);
router.put('/:id', student_controller_1.updateStudent);
router.delete('/:id', student_controller_1.deleteStudent);
exports.default = router;
//# sourceMappingURL=student.routes.js.map