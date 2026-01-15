import { Schema, model } from 'mongoose';

const questionSchema = new Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    value: { type: Number, required: true, enum: [200, 400, 600, 800, 1000] },
    category: { type: String, required: true },
    difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
    image: { type: String, required: false },
}, { timestamps: true });

export const Question = model('Question', questionSchema);

