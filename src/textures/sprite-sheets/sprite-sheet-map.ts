import {
  spriteSheets,
  type SpriteSheet,
  type SpriteSheetId,
} from "./sprite-sheet.types";

export const spriteSheetMap = Object.fromEntries(
  spriteSheets.map((spriteSheet) => [spriteSheet.id, spriteSheet]),
) as { [K in SpriteSheetId]: SpriteSheet };
