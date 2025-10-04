import * as ljs from "littlejsengine";
import * as ljsPure from "./littlejsengine.pure";

/** Interface for impure members of littlejsengine */
export type ILJS = Omit<typeof ljs, keyof typeof ljsPure>;
