import { State, fetchMoves, Move } from "@henrikthoroe/swc-client";
import Rating from ".";
import rateMobility from "./rateMobility";
import Color from "@henrikthoroe/swc-client/dist/client/Model/Color";
import rateSurrounding from "./rateSurrounding";

export default function rate(state: State, player: Color, availableMoves?: Move[]): number {
    console.time("Rate")
    // const moves = availableMoves === undefined ? fetchMoves(state) : availableMoves
    // const mobility = rateMobility(state, moves)
    const surrounding = rateSurrounding(state)
    console.timeEnd("Rate")

    switch (player) {
        case Color.Red:
            return surrounding.red - surrounding.blue
        case Color.Blue:
            return surrounding.blue - surrounding.red
    }
}