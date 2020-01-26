import { State, fetchMoves, Move } from "@henrikthoroe/swc-client";
import Rating from ".";
import rateMobility from "./rateMobility";
import Color from "@henrikthoroe/swc-client/dist/client/Model/Color";
import rateSurrounding from "./rateSurrounding";

export default function rate(state: State, player: Color): number {
    const surrounding = rateSurrounding(state)
    
    switch (player) {
        case Color.Red:
            if (surrounding.red === 6) {
                return -3000
            }

            if (surrounding.blue === 6) {
                return 3000
            }

            return Math.pow(2, surrounding.blue) - Math.pow(2, surrounding.red)
        case Color.Blue:
            if (surrounding.red === 6) {
                return 3000
            }

            if (surrounding.blue === 6) {
                return -3000
            }

            return Math.pow(2, surrounding.red) - Math.pow(2, surrounding.blue)
    }
}