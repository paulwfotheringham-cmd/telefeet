export const MAX_PLAYERS = 2;
export const ROOM_CODE_LENGTH = 6;
export const REVEAL_MS = 4500;
export const ROOM_TTL_SECONDS = 60 * 60 * 4; // 4 hours

export const GAME_MODE_TAKE_TURNS = "take_turns" as const;
export const GAME_MODE_PLAY_TOGETHER = "play_together" as const;
export const GAME_MODE_SHARED_MILLIONAIRE = "shared_millionaire" as const;
export const GAME_MODE_PARALLEL_MILLIONAIRE = "parallel_millionaire" as const;

export const MILLIONAIRE_REVEAL_MS = 3_500;

export const QUESTIONS_PER_GAME = 50;
export const TAKE_TURNS_QUESTIONS_PER_PLAYER = 25;
