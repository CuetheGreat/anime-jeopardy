// Entry point
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './config/app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/index.js';
import { setupSocketHandlers } from './socket/index.js';

const PORT = env.PORT;

const startServer = async () => {
    await connectDB();

    // Create HTTP server from Express app
    const httpServer = createServer(app);

    // Attach Socket.io
    const io = new Server(httpServer, {
        cors: {
            origin: '*', // Configure for your frontend URL in production
            methods: ['GET', 'POST'],
        },
    });

    // Set up socket event handlers
    setupSocketHandlers(io);

    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`http://localhost:${PORT}`);
        console.log('Socket.io enabled');
    });

    const gracefulShutdown = async (signal: string) => {
        console.log(`${signal} received, shutting down server...`);
        io.close();
        httpServer.close(async () => {
            await disconnectDB();
            process.exit(0);
        });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

await startServer().catch((error) => {
    console.error('Error starting server:', error);
    process.exit(1);
});
