import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';

/**
 * Custom error class for application errors with HTTP status codes.
 * @extends Error
 * @example
 * throw new AppError('Question not found', 404);
 */
export class AppError extends Error {
    statusCode: number;
    
    /**
     * Creates a new AppError instance.
     * @param message - The error message to display
     * @param statusCode - The HTTP status code (e.g., 404, 400, 500)
     */
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

/**
 * Global error handling middleware for Express.
 * Catches all errors passed via next() and sends appropriate JSON response.
 * Handles AppError (custom), Mongoose ValidationError (400), and generic errors (500).
 * Must be registered after all routes.
 * 
 * @param err - The error object (AppError, MongooseError, or generic Error)
 * @param _req - Express request object (unused)
 * @param res - Express response object
 * @param _next - Express next function (unused)
 * 
 * @example
 * // In app.ts
 * app.use(errorHandler);
 */
export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    if (err instanceof MongooseError.ValidationError) {
        res.status(400).json({ message: 'Validation failed', errors: err.message });
        return;
    }

    if (err instanceof MongooseError.CastError) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
    }

    console.error(err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
};
