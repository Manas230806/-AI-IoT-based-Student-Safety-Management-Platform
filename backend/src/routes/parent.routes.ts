import { Router } from 'express';
import { getParentProfile } from '../controllers/parent.controller';

const router = Router();

router.get('/:userId', getParentProfile);

export default router;
