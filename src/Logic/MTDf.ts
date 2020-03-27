import Logic, { SearchResult } from "./Logic";
import { State } from "@henrikthoroe/swc-client";
import evaluate from "../Rating/evaluate";
import generateMoves from "../LookAhead/generateMoves";
import simulateMove from "../LookAhead/simulateMove";
import { TranspositionTableFlag, TranspositionTableEntry } from "../Cache/createTranspositonTable";

export default class MTDf extends Logic {

    find(): SearchResult {
        this.searchState.startTime = Date.now()

        const rating = this.search(0)
        const move = this.searchState.selectedMove

        this.log()

        return {
            rating: rating,
            success: move !== null,
            value: move, 
            timedOut: this.searchState.timedOut
        }
    }

    private search(firstGuess: number): number {
        let guess = firstGuess
        let upperBound = Infinity
        let lowerBound = -Infinity
        let beta: number

        while (lowerBound < upperBound) {
            beta = Math.max(guess, lowerBound + 1)
            guess = this.negamax(this.initialState, this.horizon, beta - 1, beta, 1)

            if (guess < beta) {
                upperBound = guess
            } else {
                lowerBound = guess
            }

            console.log(guess, lowerBound, upperBound)
        }

        return guess
    }
    
}