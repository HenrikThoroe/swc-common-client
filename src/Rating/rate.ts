import { State, fetchMoves, Move } from "@henrikthoroe/swc-client";
import Rating from ".";
import rateMobility from "./rateMobility";
import Color from "@henrikthoroe/swc-client/dist/client/Model/Color";
import rateSurrounding from "./rateSurrounding";

export default function rate(state: State, player: Color): number {
    const surrounding = rateSurrounding(state)
    const mobility = rateMobility(state)

    // console.log(mobility, surrounding, player === Color.Red)
    
    switch (player) {
        case Color.Red:
            if (surrounding.red === 6) {
                return -100000
            }

            if (surrounding.blue === 6) {
                return 100000
            }

            const sRatingRed = ((Math.pow(2, surrounding.blue) - (Math.pow(2, surrounding.red) / 2)) / 64) * 2
            const mRatingRed = mobility.red * 0.5// - (mobility.blue / 2)

            return sRatingRed + mRatingRed //* mobility.red - (Math.pow(2, surrounding.red) / 2)
        case Color.Blue:
            if (surrounding.red === 6) {
                return 100000
            }

            if (surrounding.blue === 6) {
                return -100000
            }

            const sRatingBlue = ((Math.pow(2, surrounding.red) - (Math.pow(2, surrounding.blue) / 2)) / 64) * 2 
            const mRatingBlue = mobility.blue * 0.5//- (mobility.red / 2)

            return sRatingBlue + mRatingBlue //* mobility.blue  - (Math.pow(2, surrounding.blue) / 2)
    }
}