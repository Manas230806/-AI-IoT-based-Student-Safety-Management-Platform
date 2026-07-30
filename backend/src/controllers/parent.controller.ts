import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getParentProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Find the parent profile, their User record, and their linked students
    const parentProfile = await prisma.parent.findUnique({
      where: { userId: userId as string },
      include: { 
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        students: { 
          include: { 
            student: true 
          } 
        } 
      }
    });

    if (!parentProfile) {
      return res.status(404).json({ error: 'Parent profile not found' });
    }

    res.json(parentProfile);
  } catch (error) {
    console.error('Error fetching parent profile:', error);
    res.status(500).json({ error: 'Failed to fetch parent profile' });
  }
};
