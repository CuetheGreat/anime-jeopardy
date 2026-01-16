/**
 * In-memory game state manager
 * For production, consider using Redis or MongoDB for persistence
 */

export interface Player {
    id: string;
    name: string;
    score: number;
    wager?: number;
    answer?: string;
    hasAnswered: boolean;
}

export interface GameRoom {
    code: string;
    hostId: string;
    players: Map<string, Player>;
    currentQuestion: string | null;
    phase: 'lobby' | 'wagering' | 'answering' | 'revealing' | 'ended';
    createdAt: Date;
}

class GameManager {
    private games: Map<string, GameRoom> = new Map();

    /**
     * Generate a random 4-character game code
     */
    generateCode(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Ensure unique
        if (this.games.has(code)) {
            return this.generateCode();
        }
        return code;
    }

    /**
     * Create a new game room
     */
    createGame(hostId: string): GameRoom {
        const code = this.generateCode();
        const game: GameRoom = {
            code,
            hostId,
            players: new Map(),
            currentQuestion: null,
            phase: 'lobby',
            createdAt: new Date(),
        };
        this.games.set(code, game);
        return game;
    }

    /**
     * Get a game by code
     */
    getGame(code: string): GameRoom | undefined {
        return this.games.get(code.toUpperCase());
    }

    /**
     * Add a player to a game
     */
    addPlayer(code: string, playerId: string, playerName: string): Player | null {
        const game = this.getGame(code);
        if (!game || game.phase !== 'lobby') return null;

        const player: Player = {
            id: playerId,
            name: playerName,
            score: 0,
            hasAnswered: false,
        };
        game.players.set(playerId, player);
        return player;
    }

    /**
     * Remove a player from a game
     */
    removePlayer(code: string, playerId: string): boolean {
        const game = this.getGame(code);
        if (!game) return false;
        return game.players.delete(playerId);
    }

    /**
     * Start wagering phase
     */
    startWagering(code: string, question: string): boolean {
        const game = this.getGame(code);
        if (!game) return false;

        game.phase = 'wagering';
        game.currentQuestion = question;
        // Reset player answers
        game.players.forEach(player => {
            player.wager = undefined;
            player.answer = undefined;
            player.hasAnswered = false;
        });
        return true;
    }

    /**
     * Submit a player's wager
     */
    submitWager(code: string, playerId: string, wager: number): boolean {
        const game = this.getGame(code);
        if (!game || game.phase !== 'wagering') return false;

        const player = game.players.get(playerId);
        if (!player) return false;

        // Wager must be between 0 and player's score (or minimum 5)
        const maxWager = Math.max(player.score, 5);
        player.wager = Math.min(Math.max(0, wager), maxWager);
        return true;
    }

    /**
     * Check if all players have wagered
     */
    allPlayersWagered(code: string): boolean {
        const game = this.getGame(code);
        if (!game) return false;

        for (const player of game.players.values()) {
            if (player.wager === undefined) return false;
        }
        return true;
    }

    /**
     * Start answering phase
     */
    startAnswering(code: string): boolean {
        const game = this.getGame(code);
        if (!game || game.phase !== 'wagering') return false;

        game.phase = 'answering';
        return true;
    }

    /**
     * Submit a player's answer
     */
    submitAnswer(code: string, playerId: string, answer: string): boolean {
        const game = this.getGame(code);
        if (!game || game.phase !== 'answering') return false;

        const player = game.players.get(playerId);
        if (!player) return false;

        player.answer = answer;
        player.hasAnswered = true;
        return true;
    }

    /**
     * Check if all players have answered
     */
    allPlayersAnswered(code: string): boolean {
        const game = this.getGame(code);
        if (!game) return false;

        for (const player of game.players.values()) {
            if (!player.hasAnswered) return false;
        }
        return true;
    }

    /**
     * Start revealing phase
     */
    startRevealing(code: string): boolean {
        const game = this.getGame(code);
        if (!game) return false;

        game.phase = 'revealing';
        return true;
    }

    /**
     * Judge a player's answer (host decides correct/incorrect)
     */
    judgeAnswer(code: string, playerId: string, correct: boolean): boolean {
        const game = this.getGame(code);
        if (!game) return false;

        const player = game.players.get(playerId);
        if (!player || player.wager === undefined) return false;

        if (correct) {
            player.score += player.wager;
        } else {
            player.score -= player.wager;
        }
        return true;
    }

    /**
     * End the game
     */
    endGame(code: string): boolean {
        const game = this.getGame(code);
        if (!game) return false;

        game.phase = 'ended';
        return true;
    }

    /**
     * Delete a game
     */
    deleteGame(code: string): boolean {
        return this.games.delete(code.toUpperCase());
    }

    /**
     * Get game state for clients (serializable)
     */
    getGameState(code: string): object | null {
        const game = this.getGame(code);
        if (!game) return null;

        return {
            code: game.code,
            phase: game.phase,
            currentQuestion: game.currentQuestion,
            players: Array.from(game.players.values()).map(p => ({
                id: p.id,
                name: p.name,
                score: p.score,
                hasWagered: p.wager !== undefined,
                hasAnswered: p.hasAnswered,
                // Only reveal answers during revealing phase
                wager: game.phase === 'revealing' ? p.wager : undefined,
                answer: game.phase === 'revealing' ? p.answer : undefined,
            })),
        };
    }
}

export const gameManager = new GameManager();

