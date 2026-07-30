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

    // 3. Sequential Database Creation (Avoid PgBouncer Transaction Issues)
    try {
      // Check if parent user already exists
      let user = await prisma.user.findUnique({ where: { email: parentEmail } });
      let parentProfile;

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: parentEmail,
            password: hashedPassword,
            firstName: 'Parent',
            lastName: 'of ' + firstName,
            role: 'PARENT',
            schoolId: finalSchoolId
          }
        });

        parentProfile = await prisma.parent.create({
          data: {
            userId: user.id,
            phoneNumber: '0000000000' // Placeholder
          }
        });
      } else {
        parentProfile = await prisma.parent.findUnique({ where: { userId: user.id } });
        if (!parentProfile) {
           parentProfile = await prisma.parent.create({ data: { userId: user.id, phoneNumber: '0000000000' }});
        }
      }

      // Create Student
      const student = await prisma.student.create({
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
      await prisma.parentStudent.create({
        data: {
          parentId: parentProfile.id,
          studentId: student.id
        }
      });

      res.status(201).json({
        message: 'Student and Parent registered successfully',
        student: student,
        parentPassword: plainPassword
      });
    } catch (dbError: any) {
      console.error('Database Operation Error:', dbError);
      res.status(500).json({ error: 'Failed to create records', details: dbError.message || String(dbError) });
    }
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Failed to create student and parent account', details: error.message || String(error) });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { firstName, lastName, class: studentClass, parentEmail } = req.body;
    
    try {
      // 1. Update Student
      const student = await prisma.student.update({
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
          const existingUser = await prisma.user.findUnique({ where: { email: parentEmail } });
          if (existingUser && existingUser.id !== parentUserId) {
            throw new Error(`The email ${parentEmail} is already registered to another parent account.`);
          }
          
          await prisma.user.update({
            where: { id: parentUserId },
            data: { email: parentEmail }
          });
        }
      }
    } catch (err: any) {
      console.error("Update Transaction Error:", err);
      return res.status(500).json({ error: 'Failed to update student', details: err.message });
    }

    res.json({ message: 'Student updated successfully' });
  } catch (error: any) {
    console.error("Update Error:", error);
    res.status(500).json({ error: 'Failed to update student' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    
    try {
      // Delete relationships first to avoid foreign key constraints
      await prisma.parentStudent.deleteMany({ where: { studentId: id } });
      await prisma.guardianStudent.deleteMany({ where: { studentId: id } });
      await prisma.attendanceRecord.deleteMany({ where: { studentId: id } });
      await prisma.faceVerificationLog.deleteMany({ where: { studentId: id } });
      
      // Finally delete student
      await prisma.student.delete({ where: { id } });
    } catch (err: any) {
      console.error("Delete DB Error:", err);
      return res.status(500).json({ error: 'Failed to delete student from DB', details: err.message });
    }
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error: any) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
};
