export const GAME_TOKEN = Symbol("GAME_TOKEN");

/** little js engine root setup and hook definitions */
export interface IGame {
  start(): void;
}
