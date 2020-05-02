import ConcreteAspect, { substantiateAspect } from "../Rating/ConcreteAspect";
import turnValues from "./turnValues";
import { Color, State } from "@henrikthoroe/swc-client";
import scanSurrounding from "../Rating/Scanner/scanSurrounding";

interface Opts {
    surrounding?: ConcreteAspect<number>
    color?: Color
}

export default function removeTurnValue(state: State, value: number, options: Opts): number {
    // const s = options.surrounding || substantiateAspect(options.color!, scanSurrounding(state))
    // return value - turnValues[state.turn][s.opponent]
    return value
}