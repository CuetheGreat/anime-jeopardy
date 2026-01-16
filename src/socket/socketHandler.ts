import { Server, Socket } from 'socket.io';
import { gameManager, GameRoom } from './gameManager.js';

/**
 * Socket.io event handler matching the frontend specification
 */
export function setupSocketHandlers(io: Server): void {
    io.on('connection', (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`);

        /**
         * Host creates a new game room
         */
        socket.on('create-game', (data: {
            hostId: string;
            category: string;
            question: string;
            correctAnswer: string;
            players: { id: string; name: string; score: number }[];
        }) => {
            const { hostId, category, question, correctAnswer, players } = data;
            
            const game = gameManager.createGame(hostId, category, question, correctAnswer, players);
            socket.join(game.gameCode);
            
            console.log(`Game created: ${game.gameCode}`);
            socket.emit('game-created', { gameCode: game.gameCode });
        });

        /**
         * Player joins a game room
         */
        socket.on('join-game', (data: {
            gameCode: string;
            playerId: string;
            playerName: string;
        }) => {
            const { gameCode, playerId, playerName } = data;
            const game = gameManager.getGame(gameCode);

            if (!game) {
                socket.emit('error', 'Game not found');
                return;
            }

            gameManager.joinGame(gameCode, playerId, playerName);
            socket.join(gameCode);
            
            console.log(`Player ${playerName} joined game ${gameCode}`);
            socket.emit('joined-game', game);
            io.to(gameCode).emit('game-update', game);
        });

        /**
         * Host advances to next phase
         */
        socket.on('advance-phase', (data: {
            gameCode: string;
            phase: GameRoom['phase'];
        }) => {
            const { gameCode, phase } = data;
            const game = gameManager.getGame(gameCode);

            if (!game) {
                socket.emit('error', 'Game not found');
                return;
            }

            gameManager.advancePhase(gameCode, phase);
            console.log(`Game ${gameCode} advanced to phase: ${phase}`);
            io.to(gameCode).emit('game-update', game);
        });

        /**
         * Player submits their wager
         */
        socket.on('submit-wager', (data: {
            gameCode: string;
            playerId: string;
            wager: number;
        }) => {
            const { gameCode, playerId, wager } = data;
            const game = gameManager.getGame(gameCode);

            if (!game) {
                socket.emit('error', 'Game not found');
                return;
            }

            if (gameManager.submitWager(gameCode, playerId, wager)) {
                console.log(`Player ${playerId} wagered ${wager} in game ${gameCode}`);
                io.to(gameCode).emit('game-update', game);
            }
        });

        /**
         * Player submits their answer
         */
        socket.on('submit-answer', (data: {
            gameCode: string;
            playerId: string;
            answer: string;
        }) => {
            const { gameCode, playerId, answer } = data;
            const game = gameManager.getGame(gameCode);

            if (!game) {
                socket.emit('error', 'Game not found');
                return;
            }

            if (gameManager.submitAnswer(gameCode, playerId, answer)) {
                console.log(`Player ${playerId} answered in game ${gameCode}`);
                io.to(gameCode).emit('game-update', game);
            }
        });

        /**
         * Host reveals a player's answer
         */
        socket.on('reveal-answer', (data: {
            gameCode: string;
            playerId: string;
        }) => {
            const { gameCode, playerId } = data;
            const game = gameManager.getGame(gameCode);

            if (!game) {
                socket.emit('error', 'Game not found');
                return;
            }

            if (gameManager.revealAnswer(gameCode, playerId)) {
                console.log(`Revealed answer for player ${playerId} in game ${gameCode}`);
                io.to(gameCode).emit('game-update', game);
            }
        });

        /**
         * Host marks player answer as correct/incorrect
         * Note: Score calculation should be handled by frontend since it has the original scores
         */
        socket.on('mark-result', (data: {
            gameCode: string;
            playerId: string;
            correct: boolean;
        }) => {
            const { gameCode, playerId, correct } = data;
            const game = gameManager.getGame(gameCode);

            if (!game) {
                socket.emit('error', 'Game not found');
                return;
            }

            console.log(`Player ${playerId} marked ${correct ? 'correct' : 'incorrect'} in game ${gameCode}`);
            // Emit the result so frontend can calculate scores
            io.to(gameCode).emit('result-marked', { playerId, correct });
            io.to(gameCode).emit('game-update', game);
        });

        /**
         * Handle disconnection
         */
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}
