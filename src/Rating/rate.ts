import { State, fetchMoves, Move } from "@henrikthoroe/swc-client";
import Rating from ".";
import rateMobility from "./rateMobility";
import Color from "@henrikthoroe/swc-client/dist/client/Model/Color";
import rateSurrounding from "./rateSurrounding";

export default function rate(state: State, player: Color): number {
    const surrounding = rateSurrounding(state)

    // console.log(surrounding, state.undeployed.blue.length, state.undeployed.red.length)
    
    switch (player) {
        case Color.Red:
            return surrounding.blue - surrounding.red
        case Color.Blue:
            return surrounding.red - surrounding.blue
    }

    // switch (state.currentPlayer) {
    //     case Color.Red:
    //         // if (surrounding.blue === -1) {
    //         //     // console.log(-surrounding.red)
    //         //     return -surrounding.red
    //         // }

    //         return surrounding.blue * surrounding.blue - surrounding.red
    //     case Color.Blue:
    //         return surrounding.red * surrounding.red - surrounding.blue
    // }
}