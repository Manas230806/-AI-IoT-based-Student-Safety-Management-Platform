"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParentProfile = void 0;
const prisma_1 = require("../config/prisma");
const getParentProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        // Find the parent profile, their User record, and their linked students
        const parentProfile = await prisma_1.prisma.parent.findUnique({
            where: { userId: userId },
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
    }
    catch (error) {
        console.error('Error fetching parent profile:', error);
        res.status(500).json({ error: 'Failed to fetch parent profile' });
    }
};
exports.getParentProfile = getParentProfile;
//# sourceMappingURL=parent.controller.js.map