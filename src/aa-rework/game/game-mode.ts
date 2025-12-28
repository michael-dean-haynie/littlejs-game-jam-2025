export const GameModes = ["unitTester", "adventure", "towerDefense"] as const;
export type GameMode = (typeof GameModes)[number];
