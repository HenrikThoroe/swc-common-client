import Logic, { SearchResult } from "./Logic"
import Environment from "../utils/Environment"

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
        let rounds = 0

        while (lowerBound < upperBound) {
            rounds += 1
            beta = Math.max(guess, lowerBound + 1)
            guess = this.negamax(this.initialState, this.horizon, beta - 1, beta, 1)

            if (guess < beta) {
                upperBound = guess
            } else {
                lowerBound = guess
            }

            if (this.didTimeOut()) {
                break
            }
        }

        this.log()
        Environment.debugPrint(`MTDf made ${rounds} rounds`)

        return guess
    }
    
}