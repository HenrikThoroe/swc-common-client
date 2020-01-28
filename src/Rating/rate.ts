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
                return -2
            }

            if (surrounding.blue === 6) {
                return 2
            }

            const sRatingRed = (Math.pow(2, surrounding.blue) - (Math.pow(2, surrounding.red) / 2)) / 64
            const mRatingRed = mobility.red / 2// - (mobility.blue / 2)

            return sRatingRed + mRatingRed //* mobility.red - (Math.pow(2, surrounding.red) / 2)
        case Color.Blue:
            if (surrounding.red === 6) {
                return 2
            }

            if (surrounding.blue === 6) {
                return -2
            }

            const sRatingBlue = (Math.pow(2, surrounding.red) - (Math.pow(2, surrounding.blue) / 2)) / 64 
            const mRatingBlue = mobility.blue / 2 //- (mobility.red / 2)

            return sRatingBlue + mRatingBlue //* mobility.blue  - (Math.pow(2, surrounding.blue) / 2)
    }
}