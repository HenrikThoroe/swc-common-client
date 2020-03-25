import Logic, { SearchResult } from "./Logic";
import { State } from "@henrikthoroe/swc-client";
import evaluate from "../Rating/evaluate";
import generateMoves from "../LookAhead/generateMoves";
import simulateMove from "../LookAhead/simulateMove";

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
        }

        return guess
    }

    private negamax(state: State, depth: number, alpha: number, beta: number, color: number): number {
        const evaluation = evaluate(state, this.player.color)
        const moves = generateMoves(state)

        if (depth === 0 || this.isTerminating(evaluation, moves.length)) {
            return evaluation.value * color
        }

        let max = alpha
        let score: number

        for (let i = 0; i < moves.length; ++i) {
            if (this.didTimeOut()) {
                break
            }

            this.searchState.searchedNodes += 1

            score = simulateMove(state, moves[i], next => {
                return -this.negamax(next, depth - 1, -beta, -max, -color)
            })

            if (score > max) {
                max = score

                if (depth === this.horizon) {
                    this.searchState.selectedMove = moves[i]
                } 

                if (max >= beta) {
                    break
                }
            }
        }

        return max
    }
    
}