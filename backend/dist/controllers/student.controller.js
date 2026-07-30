"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.updateStudent = exports.createStudent = exports.getStudentById = exports.getStudents = void 0;
const prisma_1 = require("../config/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const getStudents = async (req, res) => {
    try {
        const students = await prisma_1.prisma.student.findMany({
            include: {
                parents: {
                    include: {
                        parent: {
                            include: {
                                user: {
                                    select: {
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(students);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};
exports.getStudents = getStudents;
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await prisma_1.prisma.student.findUnique({ where: { id } });
        if (!student)
            return res.status(404).json({ error: 'Student not found' });
        res.json(student);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch student' });
    }
};
exports.getStudentById = getStudentById;
const createStudent = async (req, res) => {
    try {
        const { firstName, lastName, studentClass, section, parentEmail, photoUrl, faceEmbedding, schoolId } = req.body;
        // Basic validation
        if (!firstName || !lastName || !parentEmail || !schoolId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        let finalSchoolId = schoolId;
        // For demo purposes, if schoolId is missing or fake, grab the first school
        if (!finalSchoolId || finalSchoolId === 'DEMO_SCHOOL_ID') {
            const firstSchool = await prisma_1.prisma.school.findFirst();
            if (firstSchool) {
                finalSchoolId = firstSchool.id;
            }
            else {
                return res.status(400).json({ error: 'No schools exist in the database yet to attach this student to.' });
            }
        }
        // 1. Generate 4-digit ID
        const rollNumber = Math.floor(1000 + Math.random() * 9000).toString();
        // 2. Generate Password
        const plainPassword = `${firstName}@${rollNumber}`;
        const hashedPassword = await bcrypt_1.default.hash(plainPassword, 10);
        // 3. Database Transaction
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // Check if parent user already exists
            let user = await tx.user.findUnique({ where: { email: parentEmail } });
            let parentProfile;
            if (!user) {
                user = await tx.user.create({
                    data: {
                        email: parentEmail,
                        password: hashedPassword,
                        firstName: 'Parent',
                        lastName: 'of ' + firstName,
                        role: 'PARENT',
                        schoolId: finalSchoolId
                    }
                });
                parentProfile = await tx.parent.create({
                    data: {
                        userId: user.id,
                        phoneNumber: '0000000000' // Placeholder
                    }
                });
            }
            else {
                parentProfile = await tx.parent.findUnique({ where: { userId: user.id } });
                if (!parentProfile) {
                    parentProfile = await tx.parent.create({ data: { userId: user.id, phoneNumber: '0000000000' } });
                }
            }
            // Create Student
            const student = await tx.student.create({
                data: {
                    firstName,
                    lastName,
                    rollNumber,
                    class: studentClass || 'N/A',
                    section: section || 'A',
                    photoUrl,
                    faceEmbedding,
                    schoolId: finalSchoolId
                }
            });
            // Link Parent and Student
            await tx.parentStudent.create({
                data: {
                    parentId: parentProfile.id,
                    studentId: student.id
                }
            });
            return { student, generatedPassword: plainPassword };
        });
        res.status(201).json({
            message: 'Student and Parent registered successfully',
            student: result.student,
            parentPassword: result.generatedPassword
        });
    }
    catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Failed to create student and parent account', details: error.message || String(error) });
    }
};
exports.createStudent = createStudent;
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, class: studentClass, parentEmail } = req.body;
        await prisma_1.prisma.$transaction(async (tx) => {
            // 1. Update Student
            const student = await tx.student.update({
                where: { id },
                data: {
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName }),
                    ...(studentClass && { class: studentClass })
                },
                include: { parents: { include: { parent: true } } }
            });
            // 2. Update Parent Email
            if (parentEmail && student.parents.length > 0) {
                const parentUserId = student.parents[0]?.parent?.userId;
                if (parentUserId) {
                    // Check if this email is already taken by a DIFFERENT user
                    const existingUser = await tx.user.findUnique({ where: { email: parentEmail } });
                    if (existingUser && existingUser.id !== parentUserId) {
                        throw new Error(`The email ${parentEmail} is already registered to another parent account.`);
                    }
                    await tx.user.update({
                        where: { id: parentUserId },
                        data: { email: parentEmail }
                    });
                }
            }
        });
        res.json({ message: 'Student updated successfully' });
    }
    catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: 'Failed to update student' });
    }
};
exports.updateStudent = updateStudent;
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.$transaction(async (tx) => {
            // Delete relationships first to avoid foreign key constraints
            await tx.parentStudent.deleteMany({ where: { studentId: id } });
            await tx.guardianStudent.deleteMany({ where: { studentId: id } });
            await tx.attendanceRecord.deleteMany({ where: { studentId: id } });
            await tx.faceVerificationLog.deleteMany({ where: { studentId: id } });
            // Finally delete student
            await tx.student.delete({ where: { id } });
        });
        res.json({ message: 'Student deleted successfully' });
    }
    catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
};
exports.deleteStudent = deleteStudent;
//# sourceMappingURL=student.controller.js.map