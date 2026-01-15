import mongoose from 'mongoose';
import { env } from "./env.js";

export const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log('Connected to MongoDB');
    }catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

export const disconnectDB = async () => {
    try{
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
        process.exit(1);    
    }
}