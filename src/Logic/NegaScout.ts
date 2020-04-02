import Logic, { SearchResult } from "./Logic";
import { State, Move } from "@henrikthoroe/swc-client";
import evaluate from "../Rating/evaluate";
import generateMoves from "../LookAhead/generateMoves";
import simulateMove from "../LookAhead/simulateMove";
import { TranspositionTableFlag, TranspositionTableEntry } from "../Cache/createTranspositonTable";

/**
 * NegaScout is an algorythm based on Alpha Beta search, but with advanced tactics to produce more cutoffs.
 * It assumes that the first move provided is also the best one. 
 * For this reason a good move ordering is essential for NegaScout to work. 
 * If the first few moves are not the best ones the performance is even worse than normal Alpha Beta.
 */
export default class NegaScout extends Logic {

    find(): SearchResult {
        this.searchState.startTime = Date.now()

        const alpha = -Infinity
        const beta = Infinity
        let rating: number = this.search(this.initialState, this.horizon, alpha, beta, 1, this.availableMoves)
        let move: Move | null = this.searchState.selectedMove

        while (!this.didTimeOut()) {
            rating = this.search(this.initialState, this.horizon++, alpha, beta, 1, this.availableMoves)
            move = this.searchState.selectedMove
        }

        this.log()

        return {
            rating: rating,
            success: move !== null,
            value: move,
            timedOut: this.searchState.timedOut
        }
    }

    private search(state: State, depth: number, alpha: number, beta: number, color: number, availableMoves?: Move[]): number {
        const ttResult = this.readTranspositionTable(state, depth, alpha, beta)

        if (ttResult) {
            const [type, value, ttAlpha, ttBeta] = ttResult

            switch (type) {
                case "exact":
                    if (depth == this.horizon) {
                        console.log("well ok that was surprising")
                    }
                    return value
                case "alpha":
                    alpha = ttAlpha
                    break
                case "beta":
                    beta = ttBeta
                    break
            }
        }

        const evaluation = evaluate(state, this.player.color)
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
                // NegaScout assumes that the first move is the best one
                // So it searches it with full with alpha beta window
                score = simulateMove(state, moves[i], next => -this.search(next, depth - 1, -beta, -alpha, -color))
            } else {
                // To create as many cutoffs as possible the following moves are searched with a null window
                score = simulateMove(state, moves[i], next => -this.search(next, depth - 1, -alpha - 1, -alpha, -color))

                // If the actual score is not within the assumed window a full alpha beta search is committed
                if (alpha < score && score < beta) {
                    score = simulateMove(state, moves[i], next => -this.search(next, depth - 1, -beta, -score, -color))
                }
            }

            if (score > alpha) {
                alpha = score 
                
                if (depth === this.horizon) {
                    this.searchState.selectedMove = moves[i]
                }
            }

            if (alpha >= beta) {
                break
            }
        }

        this.setTranspositionTable(state, score, depth, beta)

        return alpha
    }
    
}