import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import bcrypt from 'bcrypt';

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, studentClass, section, parentEmail, photoUrl, faceEmbedding, schoolId } = req.body;

    // Basic validation
    if (!firstName || !lastName || !parentEmail || !schoolId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let finalSchoolId = schoolId;
    
    // For demo purposes, if schoolId is missing or fake, grab the first school
    if (!finalSchoolId || finalSchoolId === 'DEMO_SCHOOL_ID') {
      const firstSchool = await prisma.school.findFirst();
      if (firstSchool) {
        finalSchoolId = firstSchool.id;
      } else {
        return res.status(400).json({ error: 'No schools exist in the database yet to attach this student to.' });
      }
    }

    // 1. Generate 4-digit ID
    const rollNumber = Math.floor(1000 + Math.random() * 9000).toString();
    
    // 2. Generate Password
    const plainPassword = `${firstName}@${rollNumber}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 3. Database Transaction
    const result = await prisma.$transaction(async (tx) => {
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
      } else {
        parentProfile = await tx.parent.findUnique({ where: { userId: user.id } });
        if (!parentProfile) {
           parentProfile = await tx.parent.create({ data: { userId: user.id, phoneNumber: '0000000000' }});
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
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Failed to create student and parent account', details: error.message || String(error) });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { firstName, lastName, class: studentClass, parentEmail } = req.body;
    
    await prisma.$transaction(async (tx) => {
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
  } catch (error: any) {
    console.error("Update Error:", error);
    res.status(500).json({ error: 'Failed to update student' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    
    await prisma.$transaction(async (tx) => {
      // Delete relationships first to avoid foreign key constraints
      await tx.parentStudent.deleteMany({ where: { studentId: id } });
      await tx.guardianStudent.deleteMany({ where: { studentId: id } });
      await tx.attendanceRecord.deleteMany({ where: { studentId: id } });
      await tx.faceVerificationLog.deleteMany({ where: { studentId: id } });
      
      // Finally delete student
      await tx.student.delete({ where: { id } });
    });
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error: any) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
};
