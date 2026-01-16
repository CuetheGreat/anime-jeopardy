import { Server, Socket } from 'socket.io';
import { gameManager } from './gameManager.js';

/**
 * Socket.io event handler for real-time game functionality
 */
export function setupSocketHandlers(io: Server): void {
    io.on('connection', (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`);

        /**
         * Host creates a new game
         */
        socket.on('create-game', (callback: (response: object) => void) => {
            const game = gameManager.createGame(socket.id);
            socket.join(game.code);
            console.log(`Game created: ${game.code} by ${socket.id}`);
            
            callback({
                success: true,
                gameCode: game.code,
            });
        });

        /**
         * Player joins an existing game
         */
        socket.on('join-game', (data: { gameCode: string; playerName: string }, callback: (response: object) => void) => {
            const { gameCode, playerName } = data;
            const game = gameManager.getGame(gameCode);

            if (!game) {
                callback({ success: false, error: 'Game not found' });
                return;
            }

            if (game.phase !== 'lobby') {
                callback({ success: false, error: 'Game already in progress' });
                return;
            }

            const player = gameManager.addPlayer(gameCode, socket.id, playerName);
            if (!player) {
                callback({ success: false, error: 'Could not join game' });
                return;
            }

            socket.join(gameCode);
            console.log(`Player ${playerName} joined game ${gameCode}`);

            // Notify everyone in the room
            io.to(gameCode).emit('game-state', gameManager.getGameState(gameCode));

            callback({
                success: true,
                player,
                gameState: gameManager.getGameState(gameCode),
            });
        });

        /**
         * Host starts Final Jeopardy (wagering phase)
         */
        socket.on('start-final', (data: { gameCode: string; question: string }, callback: (response: object) => void) => {
            const { gameCode, question } = data;
            const game = gameManager.getGame(gameCode);

            if (!game || game.hostId !== socket.id) {
                callback({ success: false, error: 'Not authorized' });
                return;
            }

            gameManager.startWagering(gameCode, question);
            io.to(gameCode).emit('game-state', gameManager.getGameState(gameCode));
            io.to(gameCode).emit('phase-change', { phase: 'wagering', question });

            callback({ success: true });
        });

        /**
         * Player submits wager
         */
        socket.on('submit-wager', (data: { gameCode: string; wager: number }, callback: (response: object) => void) => {
            const { gameCode, wager } = data;

            if (!gameManager.submitWager(gameCode, socket.id, wager)) {
                callback({ success: false, error: 'Could not submit wager' });
                return;
            }

            // Notify host of progress
            io.to(gameCode).emit('game-state', gameManager.getGameState(gameCode));

            // Check if all players wagered
            if (gameManager.allPlayersWagered(gameCode)) {
                io.to(gameCode).emit('all-wagered');
            }

            callback({ success: true });
        });

        /**
         * Host starts answering phase
         */
        socket.on('start-answering', (data: { gameCode: string }, callback: (response: object) => void) => {
            const { gameCode } = data;
            const game = gameManager.getGame(gameCode);

            if (!game || game.hostId !== socket.id) {
                callback({ success: false, error: 'Not authorized' });
                return;
            }

            gameManager.startAnswering(gameCode);
            io.to(gameCode).emit('game-state', gameManager.getGameState(gameCode));
            io.to(gameCode).emit('phase-change', { phase: 'answering' });

            callback({ success: true });
        });

        /**
         * Player submits answer
         */
        socket.on('submit-answer', (data: { gameCode: string; answer: string }, callback: (response: object) => void) => {
            const { gameCode, answer } = data;

            if (!gameManager.submitAnswer(gameCode, socket.id, answer)) {
                callback({ success: false, error: 'Could not submit answer' });
                return;
            }

            io.to(gameCode).emit('game-state', gameManager.getGameState(gameCode));

            // Check if all players answered
            if (gameManager.allPlayersAnswered(gameCode)) {
                io.to(gameCode).emit('all-answered');
            }

            callback({ success: true });
        });

        /**
         * Host locks answers and starts reveal
         */
        socket.on('lock-answers', (data: { gameCode: string }, callback: (response: object) => void) => {
            const { gameCode } = data;
            const game = gameManager.getGame(gameCode);

            if (!game || game.hostId !== socket.id) {
                callback({ success: false, error: 'Not authorized' });
                return;
            }

            gameManager.startRevealing(gameCode);
            io.to(gameCode).emit('game-state', gameManager.getGameState(gameCode));
            io.to(gameCode).emit('phase-change', { phase: 'revealing' });

            callback({ success: true });
        });

        /**
         * Host judges a player's answer
         */
        socket.on('judge-answer', (data: { gameCode: string; playerId: string; correct: boolean }, callback: (response: object) => void) => {
            const { gameCode, playerId, correct } = data;
            const game = gameManager.getGame(gameCode);

            if (!game || game.hostId !== socket.id) {
                callback({ success: false, error: 'Not authorized' });
                return;
            }

            gameManager.judgeAnswer(gameCode, playerId, correct);
            io.to(gameCode).emit('game-state', gameManager.getGameState(gameCode));
            io.to(gameCode).emit('answer-judged', { playerId, correct });

            callback({ success: true });
        });

        /**
         * Host ends the game
         */
        socket.on('end-game', (data: { gameCode: string }, callback: (response: object) => void) => {
            const { gameCode } = data;
            const game = gameManager.getGame(gameCode);

            if (!game || game.hostId !== socket.id) {
                callback({ success: false, error: 'Not authorized' });
                return;
            }

            gameManager.endGame(gameCode);
            io.to(gameCode).emit('game-state', gameManager.getGameState(gameCode));
            io.to(gameCode).emit('phase-change', { phase: 'ended' });

            callback({ success: true });
        });

        /**
         * Request current game state
         */
        socket.on('get-state', (data: { gameCode: string }, callback: (response: object) => void) => {
            const gameState = gameManager.getGameState(data.gameCode);
            callback({
                success: !!gameState,
                gameState,
            });
        });

        /**
         * Handle disconnection
         */
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            // Could implement player removal/reconnection logic here
        });
    });
}

