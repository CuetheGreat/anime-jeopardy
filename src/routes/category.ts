import { Router } from 'express';
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from '../controllers/index.js';
import { asyncHandler } from '../middleware/index.js';

const router = Router();

router.post('/', asyncHandler(createCategory));
router.get('/', asyncHandler(getCategories));
router.get('/:id', asyncHandler(getCategoryById));
router.put('/:id', asyncHandler(updateCategory));
router.delete('/:id', asyncHandler(deleteCategory));

export default router;
