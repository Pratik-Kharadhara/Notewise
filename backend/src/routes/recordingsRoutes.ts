import { Router } from 'express';
import { recordingsController } from '../controllers/recordingsController';
import { qaController } from '../controllers/qaController';
import { upload } from '../middleware/upload';

const router = Router();

// Middleware to accept either 'file' (contract) or 'audio' (frontend)
const flexibleUpload = (req: any, res: any, next: any) => {
  upload.any()(req, res, (err) => {
    if (err) return next(err);
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

// Official contract upload endpoint
router.post('/upload', flexibleUpload, recordingsController.upload);

// Frontend upload endpoint
router.post('/', flexibleUpload, recordingsController.upload);

// Listing & CRUD
router.get('/', recordingsController.list);
router.get('/:id', recordingsController.getById);
router.patch('/:id', recordingsController.update);
router.delete('/:id', recordingsController.delete);

// Frontend Q&A endpoint
router.post('/:id/ask', qaController.askByRecording);

export default router;

