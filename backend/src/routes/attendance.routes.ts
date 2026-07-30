import { Router } from 'express';
import { getStudentAttendance, getSchoolAttendance, getParentAttendance } from '../controllers/attendance.controller';

const router = Router();

router.get('/student/:id', getStudentAttendance);
router.get('/school/:schoolId', getSchoolAttendance);
router.get('/parent/:userId', getParentAttendance);

export default router;
