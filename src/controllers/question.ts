import { Request, Response } from 'express';
import { Category, Question } from '../models/index.js';
import { AppError } from '../middleware/index.js';

export const createQuestion = async (req: Request, res: Response) => {
    const { question, answer, value, category, difficulty, image } = req.body;
    const newQuestion = await Question.create({ question, answer, value, category, difficulty, image });
    res.status(201).json(newQuestion);
};

export const getQuestions = async (_req: Request, res: Response) => {
    const questions = await Question.find();
    if (questions.length === 0) {
        throw new AppError('No questions found', 404);
    }
    res.status(200).json(questions);
};

export const getQuestionById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) {
        throw new AppError('Question not found', 404);
    }
    res.status(200).json(question);
};

export const getQuestionsByCategory = async (req: Request, res: Response) => {
    const { category } = req.params;
    const questions = await Question.find({ category });
    if (questions.length === 0) {
        throw new AppError('No questions found for this category', 404);
    }
    res.status(200).json(questions);
};

export const getQuestionsByDifficulty = async (req: Request, res: Response) => {
    const { difficulty } = req.params;
    const questions = await Question.find({ difficulty });
    if (questions.length === 0) {
        throw new AppError('No questions found for this difficulty', 404);
    }
    res.status(200).json(questions);
};

export const updateQuestion = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { question, answer, value, category, difficulty, image } = req.body;
    const updatedQuestion = await Question.findByIdAndUpdate(
        id,
        { question, answer, value, category, difficulty, image },
        { new: true }
    );
    if (!updatedQuestion) {
        throw new AppError('Question not found', 404);
    }
    res.status(200).json(updatedQuestion);
};

export const deleteQuestion = async (req: Request, res: Response) => {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);
    if (!question) {
        throw new AppError('Question not found', 404);
    }
    res.status(200).json(question);
};

export const deleteQuestionsByCategory = async (req: Request, res: Response) => {
    const { category } = req.params;
    const questions = await Question.deleteMany({ category });
    if (questions.deletedCount === 0) {
        throw new AppError('No questions found for this category', 404);
    }
    const deletedCategory = await Category.deleteOne({ name: category });
    if (deletedCategory.deletedCount === 0) {
        throw new AppError('Category not found', 404);
    }
    res.status(200).json({ message: 'Questions deleted successfully', deletedCount: questions.deletedCount });
};
