import * as LJS from "littlejsengine";

export const ENGINE_TOKEN = Symbol("ENGINE_TOKEN");

export type IEngine = Pick<typeof LJS, "frame">;
