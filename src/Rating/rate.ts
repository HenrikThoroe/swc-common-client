import { State, fetchMoves, Move } from "@henrikthoroe/swc-client";
import Rating from ".";
import rateMobility from "./rateMobility";
import Color from "@henrikthoroe/swc-client/dist/client/Model/Color";
import rateSurrounding from "./rateSurrounding";
import Timer from "../utils/Timer";

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

    const ownConclusion = Math.pow(2, ownSurrounding) * ownMobility
    const opponentConclusion = Math.pow(2, opponentSurrounding - 1) * opponentMobility

    return ownConclusion - opponentConclusion
}

export default function rate(state: State, player: Color): number {
    const surrounding = rateSurrounding(state)
    const mobility = rateMobility(state)
    
    switch (player) {
        case Color.Red:
            if (surrounding.red === 6) {
                return -100000
            }

            if (surrounding.blue === 6) {
                return 100000
            }

            // const sRatingRed = ((Math.pow(2, surrounding.blue) - (Math.pow(2, surrounding.red) / 2)) / 64) * 2
            // const mRatingRed = mobility.red * 0.5// - (mobility.blue / 2)

            // return sRatingRed + mRatingRed //* mobility.red - (Math.pow(2, surrounding.red) / 2)
            return conclude(surrounding.red, surrounding.blue, mobility.red, mobility.blue)
        case Color.Blue:
            if (surrounding.red === 6) {
                return 100000
            }

            if (surrounding.blue === 6) {
                return -100000
            }

            // const sRatingBlue = ((Math.pow(2, surrounding.red) - (Math.pow(2, surrounding.blue) / 2)) / 64) * 2 
            // const mRatingBlue = mobility.blue * 0.5//- (mobility.red / 2)

            // return sRatingBlue + mRatingBlue //* mobility.blue  - (Math.pow(2, surrounding.blue) / 2)

            return conclude(surrounding.blue, surrounding.red, mobility.blue, mobility.red)
    }
}