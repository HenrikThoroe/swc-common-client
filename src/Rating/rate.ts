import { State, fetchMoves } from "@henrikthoroe/swc-client";
import Rating from ".";
import rateMobility from "./rateMobility";

export default function rate(state: State): Rating {
    return {
        mobility: rateMobility(state, fetchMoves(state)),
        surrounding: 0
    }
}