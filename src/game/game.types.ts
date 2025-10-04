export const GAME_TOKEN = "GAME_TOKEN" as const;

/** The main entry point in terms of initializing the littlejs engine and starting the game */
export interface IGame {
  start(): void;
}
