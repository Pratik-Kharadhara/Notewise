import { Router } from 'express';
import { jobsController } from '../controllers/jobsController';
import { qaController } from '../controllers/qaController';

const router = Router();

// Job status polling
router.get('/:id', jobsController.getStatus);

// Job transcript
router.get('/:id/transcript', jobsController.getTranscript);

// Job outputs by type (notes, cheatsheet, mindmap, qa)
router.get('/:id/outputs/:type', jobsController.getOutput);

// Selective retry
router.post('/:id/retry', jobsController.retry);

// Grounded Q&A per contract
router.post('/:id/qa', qaController.askByJob);

export default router;

