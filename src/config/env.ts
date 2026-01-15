import 'dotenv/config';

export const env = {
    MONGODB_URI: process.env.MONGODB_URI!,
    PORT: Number(process.env.PORT!),
    NODE_ENV: process.env.NODE_ENV!,
} as const;
