import { Schema, model } from 'mongoose';

const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
    image: { type: String, required: false },
}, { timestamps: true });

export const Category = model('Category', CategorySchema);