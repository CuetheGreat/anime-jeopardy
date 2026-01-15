// Entry point
import app from './config/app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/index.js';

const PORT = env.PORT

const startServer = async () => {
    await connectDB();

    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`http://localhost:${PORT}`);
    });

    const gracefulShutdown = async (signal: string) => {
        console.log(`${signal} received, shutting down server...`);
        server.close(async () => {
            await disconnectDB();
            process.exit(0);
        });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

await startServer().catch((error) => {
    console.error('Error starting server:', error);
    process.exit(1);
})
