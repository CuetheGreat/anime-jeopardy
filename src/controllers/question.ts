import { Request, Response } from 'express';
import { Category, Question } from '../models/index.js';
import { AppError } from '../middleware/index.js';

export const createQuestion = async (req: Request, res: Response) => {
    const { question, answer, value, category, difficulty, image } = req.body;
    const newQuestion = await Question.create({ question, answer, value, category, difficulty, image });
    res.status(201).json(newQuestion);
};

export const getQuestions = async (req: Request, res: Response) => {
    const { category, difficulty, value} = req.query;
   
    const filter:  Record<string, string | number> = {}
    if (category) filter.category = category as string; 
    if (difficulty) filter.difficulty = difficulty as string;
    if (value) filter.value = Number(value);
    const questions = await Question.find(filter);
    
    if (questions.length === 0) {
        throw new AppError('No questions found for this category or difficulty or value', 404);
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
