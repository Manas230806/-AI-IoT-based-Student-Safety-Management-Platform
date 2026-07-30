"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_1 = require("../controllers/attendance.controller");
const router = (0, express_1.Router)();
router.get('/student/:id', attendance_controller_1.getStudentAttendance);
router.get('/school/:schoolId', attendance_controller_1.getSchoolAttendance);
router.get('/parent/:userId', attendance_controller_1.getParentAttendance);
exports.default = router;
//# sourceMappingURL=attendance.routes.js.map