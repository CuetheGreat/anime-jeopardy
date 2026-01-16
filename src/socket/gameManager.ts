/**
 * In-memory game state manager for Final Jeopardy
 */

export interface Player {
    playerId: string;
    playerName: string;
    wager: number;
    answer: string;
    revealed: boolean;
}

export interface GameRoom {
    gameCode: string;
    hostId: string;
    phase: 'waiting' | 'wagers' | 'question' | 'answers' | 'locked' | 'revealing';
    category: string;
    question: string;
    correctAnswer: string;
    players: Player[];
}

class GameManager {
    private games: Map<string, GameRoom> = new Map();

    /**
     * Generate a random 6-character game code
     */
    generateCode(): string {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        if (this.games.has(code)) {
            return this.generateCode();
        }
        return code;
    }

    /**
     * Create a new game room
     */
    createGame(
        hostId: string,
        category: string,
        question: string,
        correctAnswer: string,
        players: { id: string; name: string; score: number }[]
    ): GameRoom {
        const gameCode = this.generateCode();
        const game: GameRoom = {
            gameCode,
            hostId,
            phase: 'waiting',
            category,
            question,
            correctAnswer,
            players: players.map(p => ({
                playerId: p.id,
                playerName: p.name,
                wager: 0,
                answer: '',
                revealed: false,
            })),
        };
        this.games.set(gameCode, game);
        return game;
    }

    /**
     * Get a game by code
     */
    getGame(code: string): GameRoom | undefined {
        return this.games.get(code.toUpperCase());
    }

    /**
     * Add or find a player in a game
     */
    joinGame(code: string, playerId: string, playerName: string): Player | null {
        const game = this.getGame(code);
        if (!game) return null;

        // Check if player already exists by name
        let player = game.players.find(p => p.playerName === playerName);
        if (!player) {
            player = {
                playerId,
                playerName,
                wager: 0,
                answer: '',
                revealed: false,
            };
            game.players.push(player);
        }
        return player;
    }

    /**
     * Advance game phase
     */
    advancePhase(code: string, phase: GameRoom['phase']): boolean {
        const game = this.getGame(code);
        if (!game) return false;
        game.phase = phase;
        return true;
    }

    /**
     * Submit a player's wager
     */
    submitWager(code: string, playerId: string, wager: number): boolean {
        const game = this.getGame(code);
        if (!game) return false;

        const player = game.players.find(p => p.playerId === playerId);
        if (!player) return false;

        player.wager = wager;
        return true;
    }

    /**
     * Submit a player's answer
     */
    submitAnswer(code: string, playerId: string, answer: string): boolean {
        const game = this.getGame(code);
        if (!game) return false;

        const player = game.players.find(p => p.playerId === playerId);
        if (!player) return false;

        player.answer = answer;
        return true;
    }

    /**
     * Reveal a player's answer
     */
    revealAnswer(code: string, playerId: string): boolean {
        const game = this.getGame(code);
        if (!game) return false;

        const player = game.players.find(p => p.playerId === playerId);
        if (!player) return false;

        player.revealed = true;
        return true;
    }

    /**
     * Delete a game
     */
    deleteGame(code: string): boolean {
        return this.games.delete(code.toUpperCase());
    }
}

export const gameManager = new GameManager();
