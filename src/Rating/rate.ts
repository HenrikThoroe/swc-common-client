import { State, fetchMoves, Move } from "@henrikthoroe/swc-client";
import Rating from ".";
import rateMobility from "./rateMobility";
import Color from "@henrikthoroe/swc-client/dist/client/Model/Color";
import rateSurrounding from "./rateSurrounding";
import Timer from "../utils/Timer";
import rateFocus from "./rateFocus";

function guard(x: number, min: number, max: number): number {
    if (x > max) return max
    if (x < min) return min

    return x
}

function conclude(ownSurrounding: number, opponentSurrounding: number, ownMobility: number, opponentMobility: number) {
    ownSurrounding = guard(ownSurrounding, 0, 6)
    opponentSurrounding = guard(opponentSurrounding, 0, 6)
    ownMobility = guard(ownMobility, 0, 2)
    opponentMobility = guard(opponentMobility, 0, 2)

    const ownConclusion = Math.pow(2, opponentSurrounding) * ownMobility
    const opponentConclusion = Math.pow(2, ownSurrounding) * opponentMobility

    return ownConclusion - opponentConclusion
}

export default function rate(state: State, player: Color, causingMove?: Move, moves?: Move[]): number {
    const surrounding = rateSurrounding(state)
    const mobility = rateMobility(state, moves)
    const focus = causingMove ? rateFocus(state, player, causingMove) : 1
    
    switch (player) {
        case Color.Red:
            if (surrounding.red === 6) {
                return -100000
            }

            if (surrounding.blue === 6) {
                return 100000
            }

            return conclude(surrounding.red, surrounding.blue, mobility.red, mobility.blue) * focus
        case Color.Blue:
            if (surrounding.red === 6) {
                return 100000
            }

            if (surrounding.blue === 6) {
                return -100000
            }

            return conclude(surrounding.blue, surrounding.red, mobility.blue, mobility.red) * focus
    }
}