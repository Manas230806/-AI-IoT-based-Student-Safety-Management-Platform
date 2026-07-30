"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => res.json({ message: 'API v1' }));
const attendance_routes_1 = __importDefault(require("./attendance.routes"));
const student_routes_1 = __importDefault(require("./student.routes"));
const parent_routes_1 = __importDefault(require("./parent.routes"));
router.use('/students', student_routes_1.default);
router.use('/parents', parent_routes_1.default);
// router.use('/buses', busRoutes);
router.use('/attendance', attendance_routes_1.default);
exports.default = router;
//# sourceMappingURL=api.routes.js.map