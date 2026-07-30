"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchoolAttendance = exports.getParentAttendance = exports.getStudentAttendance = void 0;
const prisma_1 = require("../config/prisma");
const getStudentAttendance = async (req, res) => {
    try {
        const id = req.params.id;
        const attendance = await prisma_1.prisma.attendanceRecord.findMany({
            where: { studentId: id },
            orderBy: { timestamp: 'desc' },
            include: {
                bus: true,
            }
        });
        res.json(attendance);
    }
    catch (error) {
        console.error('Error fetching student attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
};
exports.getStudentAttendance = getStudentAttendance;
const getParentAttendance = async (req, res) => {
    try {
        const { userId } = req.params;
        const finalUserId = userId;
        // Find the parent profile and their linked students
        const parentProfile = await prisma_1.prisma.parent.findUnique({
            where: { userId: finalUserId },
            include: { students: { include: { student: true } } }
        });
        if (!parentProfile) {
            return res.json([]);
        }
        const studentIds = parentProfile.students.map((ps) => ps.studentId);
        const attendance = await prisma_1.prisma.attendanceRecord.findMany({
            where: { studentId: { in: studentIds } },
            orderBy: { timestamp: 'desc' },
            include: {
                bus: true,
                student: true
            }
        });
        res.json(attendance);
    }
    catch (error) {
        console.error('Error fetching parent attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
};
exports.getParentAttendance = getParentAttendance;
const getSchoolAttendance = async (req, res) => {
    try {
        const schoolId = req.params.schoolId;
        // We want the daily activity for all students in the school
        const attendance = await prisma_1.prisma.attendanceRecord.findMany({
            where: {
                student: {
                    schoolId: schoolId
                }
            },
            include: {
                student: true,
                bus: true,
            },
            orderBy: [
                { student: { firstName: 'asc' } },
                { timestamp: 'desc' }
            ]
        });
        res.json(attendance);
    }
    catch (error) {
        console.error('Error fetching school attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
};
exports.getSchoolAttendance = getSchoolAttendance;
//# sourceMappingURL=attendance.controller.js.map