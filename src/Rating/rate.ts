import { State, fetchMoves, Move } from "@henrikthoroe/swc-client";
import Rating from ".";
import rateMobility from "./rateMobility";
import Color from "@henrikthoroe/swc-client/dist/client/Model/Color";
import rateSurrounding from "./rateSurrounding";

export default function rate(state: State, availableMoves?: Move[]): Rating {
    const moves = availableMoves === undefined ? fetchMoves(state) : availableMoves
    const mobility = rateMobility(state, moves)
    const surrounding = rateSurrounding(state, moves)

    return {
        mobility: mobility,
        surrounding: surrounding
    }
}