import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => res.json({ message: 'API v1' }));

import attendanceRoutes from './attendance.routes';
import studentRoutes from './student.routes';
import parentRoutes from './parent.routes';

router.use('/students', studentRoutes);
router.use('/parents', parentRoutes);
// router.use('/buses', busRoutes);

router.use('/attendance', attendanceRoutes);

export default router;
