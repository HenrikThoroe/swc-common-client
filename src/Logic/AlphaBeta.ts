import Logic, { SearchResult } from "./Logic";
import { State, Move } from "@henrikthoroe/swc-client";
import evaluate from "../Rating/evaluate";
import simulateMove from "../LookAhead/simulateMove";
import generateMoves from "../LookAhead/generateMoves";

export default class AlphaBeta extends Logic {
    
    find(): SearchResult {
        const alpha = -Infinity
        const beta = Infinity
        let rating = NaN
        let move: Move | null

        while (!this.searchState.timedOut) {
            const res = this.max(this.initialState, this.availableMoves, this.horizon, alpha, beta)
            this.horizon += 1

            if (!this.searchState.timedOut || this.didTimeOut() || isNaN(rating) || res === 200) {
                rating = res
            }

            if (this.didTimeOut()) {
                break
            }
        }

        move = this.searchState.selectedMove

        this.log()

        return {
            rating: rating,
            success: move !== null,
            value: move,
            timedOut: this.searchState.timedOut
        }
    }
    
    private max(state: State, moves: Move[], depth: number, alpha: number, beta: number): number {
        const evaluation = evaluate(state, this.player.color)

        if (evaluation.isGameOver || this.didTimeOut()) {
            return evaluation.value
        }

        if (depth === 0) {
            return evaluation.value
        }

        let max = alpha
        let c = 0
        let move: Move

        for (let i = 0; i < moves.length; ++i) {
            move = moves[i]
            c += 1

            if (this.didTimeOut()) {
                this.searchState.timedOut = true

                if (depth === this.horizon) {
                    console.log(`Timed out after searching ${c} of ${moves.length} nodes.`)
                }
                break
            }
 
            this.searchState.searchedNodes += 1
            const rating = simulateMove(state, move, next => {
                return this.min(next, generateMoves(next), depth - 1, max, beta)
            })
            
            if (rating > max) {
                max = rating
                
                if (depth === this.horizon) {
                    this.searchState.selectedMove = move
                }
            }
    
            // Bring some random in to prevent opponent from finding some sort of pattern
            if (rating === max && Math.random() > 0.5 && depth === this.horizon) {
                this.searchState.selectedMove = move
            }

            if (max >= beta) {
                break
            }
        }

        return max
    }

    private min(state: State, moves: Move[], depth: number, alpha: number, beta: number): number {
        const evaluation = evaluate(state, this.player.color)

        if (evaluation.isGameOver || this.didTimeOut()) {
            return evaluation.value
        }

        if (depth === 0) {
            return evaluation.value
        }

        let min = beta
        let move: Move

        for (let i = 0; i < moves.length; ++i) {
            move = moves[i]

            if (this.didTimeOut()) {
                this.searchState.timedOut = true
                break
            }

            this.searchState.searchedNodes += 1
            const rating = simulateMove(state, move, next => {
                return this.max(next, generateMoves(next), depth - 1, alpha, min)
            })
            
            if (rating < min) {
                min = rating
            }

            if (rating <= alpha) {
                break
            }
        }

        return min
    }
}