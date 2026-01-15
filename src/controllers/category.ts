import { Request, Response } from 'express';
import { Category } from '../models/index.js';
import { AppError } from '../middleware/index.js';

export const createCategory = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json(category);
};

export const getCategories = async (_req: Request, res: Response) => {
    const categories = await Category.find();
    res.status(200).json(categories);
};

export const getCategoryById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
        throw new AppError('Category not found', 404);
    }
    res.status(200).json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(id, { name, description }, { new: true });
    if (!category) {
        throw new AppError('Category not found', 404);
    }
    res.status(200).json(category);
};

export const deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
        throw new AppError('Category not found', 404);
    }
    res.status(200).json(category);
};
