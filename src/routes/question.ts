import { Router } from 'express';
import { createQuestion, getQuestions, getQuestionById, updateQuestion, deleteQuestion, deleteQuestionsByCategory } from '../controllers/index.js';
import { asyncHandler } from '../middleware/index.js';

const router = Router();

router.post('/', asyncHandler(createQuestion));
router.get('/', asyncHandler(getQuestions));
router.get('/:id', asyncHandler(getQuestionById));
router.put('/:id', asyncHandler(updateQuestion));
router.delete('/category/:category', asyncHandler(deleteQuestionsByCategory));
router.delete('/:id', asyncHandler(deleteQuestion));

export default router;
