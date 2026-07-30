import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getStudentAttendance = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const attendance = await prisma.attendanceRecord.findMany({
      where: { studentId: id },
      orderBy: { timestamp: 'desc' },
      include: {
        bus: true,
      }
    });
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

export const getParentAttendance = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const finalUserId = userId as string;
    
    // Find the parent profile and their linked students
    const parentProfile: any = await prisma.parent.findUnique({
      where: { userId: finalUserId },
      include: { students: { include: { student: true } } }
    });

    if (!parentProfile) {
      return res.json([]);
    }

    const studentIds = parentProfile.students.map((ps: any) => ps.studentId);

    const attendance = await prisma.attendanceRecord.findMany({
      where: { studentId: { in: studentIds } },
      orderBy: { timestamp: 'desc' },
      include: {
        bus: true,
        student: true
      }
    });
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching parent attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

export const getSchoolAttendance = async (req: Request, res: Response) => {
  try {
    const schoolId = req.params.schoolId as string;
    
    // If the admin doesn't have a school assigned yet, fetch all attendance
    const whereClause = (!schoolId || schoolId === 'null' || schoolId === 'all') 
      ? {} 
      : { student: { schoolId: schoolId } };

    // We want the daily activity for all students in the school
    const attendance = await prisma.attendanceRecord.findMany({
      where: whereClause,
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
  } catch (error) {
    console.error('Error fetching school attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};
