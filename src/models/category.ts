import { Schema, model } from 'mongoose';
import { randomUUID } from 'node:crypto';

const CategorySchema = new Schema({
    id: { type: String, required: true, unique: true, default: () => randomUUID() },
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
}, { timestamps: true });

export const Category = model('Category', CategorySchema);