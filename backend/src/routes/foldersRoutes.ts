import { Router } from 'express';
import { foldersController } from '../controllers/foldersController';

const router = Router();

router.get('/', foldersController.list);
router.post('/', foldersController.create);
router.patch('/:id', foldersController.update);
router.delete('/:id', foldersController.delete);

export default router;

