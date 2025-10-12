import { enumerationFactory } from "../../core/enumeration-factory";

/** These are the inputs that the game logic understands */
export const GameInputs = enumerationFactory(
  "move",
  "faceDirection",
  "facePosition",
);
export type GameInput = ReturnType<typeof GameInputs.values>[number];

/** These are command objects for particular inputs. Can include parameters. */
export interface IGameInputCommand {
  id: GameInput;
}
