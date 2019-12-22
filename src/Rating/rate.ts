import { State, fetchMoves } from "@henrikthoroe/swc-client";
import Rating from ".";
import rateMobility from "./rateMobility";
import Color from "@henrikthoroe/swc-client/dist/client/Model/Color";
import rateSurrounding from "./rateSurrounding";

export default function rate(state: State): Rating {
    const moves = fetchMoves(state)
    const mobility = rateMobility(state, moves)
    const surrounding = rateSurrounding(state, moves)

    return {
        mobility: mobility,
        surrounding: surrounding
    }
}