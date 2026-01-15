import { Request, Response, NextFunction } from 'express';

/**
 * Type definition for async Express route handlers.
 */
type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Wraps async route handlers to automatically catch errors and pass them to Express error middleware.
 * Eliminates the need for try/catch blocks in every controller.
 * 
 * @param fn - The async route handler function to wrap
 * @returns A wrapped function that catches promise rejections
 * 
 * @example
 * // In routes file
 * router.get('/:id', asyncHandler(getQuestionById));
 * 
 * // Controller can now throw errors without try/catch
 * export const getQuestionById = async (req, res) => {
 *     const question = await Question.findById(req.params.id);
 *     if (!question) throw new AppError('Not found', 404);
 *     res.json(question);
 * };
 */
export const asyncHandler = (fn: AsyncFunction) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
