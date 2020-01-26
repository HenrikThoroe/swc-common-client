import { State, fetchMoves, Move } from "@henrikthoroe/swc-client";
import Rating from ".";
import rateMobility from "./rateMobility";
import Color from "@henrikthoroe/swc-client/dist/client/Model/Color";
import rateSurrounding from "./rateSurrounding";

export default function rate(state: State, player: Color): number {
    const surrounding = rateSurrounding(state)
    
    switch (player) {
        case Color.Red:
            return Math.pow(2, surrounding.blue) - Math.pow(2, surrounding.red)
        case Color.Blue:
            return Math.pow(2, surrounding.red) - Math.pow(2, surrounding.blue)
    }
}