import Logic, { SearchResult } from "./Logic";
import { State, Move } from "@henrikthoroe/swc-client";
import rate from "../Rating/rate";
import generateMoves from "../LookAhead/generateMoves";
import simulateMove from "../LookAhead/simulateMove";

export default class NegaScout extends Logic {

    find(): SearchResult {
        this.searchState.startTime = Date.now()

        const alpha = -Infinity
        const beta = Infinity
        const rating = this.search(this.initialState, this.horizon, alpha, beta, 1, this.availableMoves)
        const move = this.searchState.selectedMove

        this.log()

        return {
            rating: rating,
            success: move !== null,
            value: move,
            timedOut: this.searchState.timedOut
        }
    }

    private search(state: State, depth: number, alpha: number, beta: number, color: number, availableMoves?: Move[]): number {
        const evaluation = rate(state, this.player.color)
        const moves = availableMoves ? availableMoves : generateMoves(state)

        if (depth === 0 || evaluation.isGameOver || this.didTimeOut() || moves.length === 0) {
            return evaluation.value * color
        }

        let score: number = 0

        for (let i = 0; i < moves.length; ++i) {
            this.searchState.searchedNodes += 1

            if (this.didTimeOut()) {
                break
            }

            if (i === 0) {
                score = simulateMove(state, moves[i], next => -this.search(next, depth - 1, -beta, -alpha, -color))
            } else {
                score = simulateMove(state, moves[i], next => -this.search(next, depth - 1, -alpha - 1, -alpha, -color))

                if (alpha < score && score < beta) {
                    score = simulateMove(state, moves[i], next => -this.search(next, depth - 1, -beta, -score, -color))
                }
            }

            if (score > alpha) {
                alpha = score 
                
                if (depth === this.horizon) {
                    console.log("Choose:", i, moves[i])
                    console.log(state.currentPlayer, color, moves.length)
                    this.searchState.selectedMove = moves[i]
                }
            }

            if (alpha >= beta) {
                break
            }
        }

        return alpha
    }
    
}