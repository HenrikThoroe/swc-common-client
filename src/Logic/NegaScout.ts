import Logic, { SearchResult } from "./Logic";
import { State, Move } from "@henrikthoroe/swc-client";
import evaluate from "../Rating/evaluate";
import generateMoves from "../LookAhead/generateMoves";
import simulateMove from "../LookAhead/simulateMove";
import { loadPartialConfig } from "@babel/core";
import { TranspositionTableFlag, TranspositionTableEntry } from "../Cache/createTranspositonTable";
import Rating from "../Rating";
import Environment from "../utils/Environment";
import Aspect from "../Rating/Aspect";

/**
 * NegaScout is an algorythm based on Alpha Beta search, but with advanced tactics to produce more cutoffs.
 * It assumes that the first move provided is also the best one. 
 * For this reason a good move ordering is essential for NegaScout to work. 
 * If the first few moves are not the best ones the performance is even worse than normal Alpha Beta.
 */
export default class NegaScout extends Logic {

    private cutoffs = 0

    find(): SearchResult {
        this.searchState.startTime = Date.now()

        const alpha = -Infinity
        const beta = Infinity
        const initialRating = evaluate(this.initialState, this.player.color)
        let rating: number
        let move: Move | null = null

        do {
            rating = this.search(this.initialState, this.horizon, alpha, beta, 1, initialRating, false, this.availableMoves)
            
            if (!this.didTimeOut() || rating >= 200 || move === null) {
                move = this.searchState.selectedMove
            }

            if (rating >= 190 || rating <= -195 || rating === 190) {
                break
            }

            this.horizon += 1
        } while (!this.didTimeOut())

        this.log()

        if (move === null) {
            Environment.print("NO MOVE SELECTED")
        }
        
        // If somebody is interested just change the flag to true
        if (false) {
            Environment.debugPrint(`Cutoff Ratio: ${this.cutoffs / this.searchState.searchedNodes}`)
        }

        return {
            rating: rating,
            success: move !== null,
            value: move,
            timedOut: this.searchState.timedOut
        }
    }

    private isQuiet(previous: Rating, current: Rating): boolean {
        // Only trigger quiescene search at the end of the game
        if (current.surrounding.opponent < 5) {
            return true
        }

        // Quiet if the surrounding of both queens did not change
        if (previous.surrounding.opponent !== current.surrounding.opponent || previous.surrounding.own !== current.surrounding.own) {
            return true
        }

        return false
    }

    private search(state: State, depth: number, alpha: number, beta: number, color: number, previous: Rating, quiescene: boolean, availableMoves?: Move[]): number {
        const entry = Logic.transpositionTable.read(state) 
        const originalAlpha = alpha

        if (entry && entry.depth >= depth) {
            if (entry.flag === TranspositionTableFlag.Exact) {
                let ignore = false

                if (entry.depth === depth && depth === this.horizon) {
                    if (typeof(entry.move) !== "number" && entry.move !== null) {
                        this.searchState.selectedMove = entry.move
                    } else {
                        ignore = true
                    }   
                    
                }

                if (!ignore) {
                    return entry.value
                }

            } else if (entry.flag === TranspositionTableFlag.LowerBound) {
                alpha = Math.max(alpha, entry.value)
            } else if (entry.flag === TranspositionTableFlag.UpperBound) {
                beta = Math.min(entry.value, beta)
            }
        }


        const evaluation = evaluate(state, this.player.color, color)
        const moves = availableMoves ? availableMoves : generateMoves(state)

        if (evaluation.isGameOver || this.didTimeOut() || moves.length === 0 || depth === 0) {
            if (moves.length === 0) return -200 * color
            return evaluation.value * color
        }

        // if (depth === 0) {
        //     // Move is not quiet
        //     if (!quiescene && !this.isQuiet(previous, evaluation)) {
        //         // Environment.debugPrint("Searching Deeper")
        //         quiescene = true
        //         depth += 2
        //     } else {
        //         return evaluation.value * color
        //     }
        //     // return evaluation.value * color
        // }

        let score: number = 0

        this.applyKillerHeuristic(state, moves)

        for (let i = 0; i < moves.length; ++i) {
            this.searchState.searchedNodes += 1

            if (this.didTimeOut()) {
                break
            }

            if (i === 0) {
                // NegaScout assumes that the first move is the best one
                // So it searches it with full with alpha beta window
                score = simulateMove(state, moves[i], next => -this.search(next, depth - 1, -beta, -alpha, -color, evaluation, quiescene))
            } else {
                // To create as many cutoffs as possible the following moves are searched with a null window
                score = simulateMove(state, moves[i], next => -this.search(next, depth - 1, -alpha - 1, -alpha, -color, evaluation, quiescene))

                // If the actual score is not within the assumed window a full alpha beta search is committed
                if (alpha < score && score < beta) {
                    score = simulateMove(state, moves[i], next => -this.search(next, depth - 1, -beta, -score, -color, evaluation, quiescene))
                }
            }

            if (score > alpha) {
                alpha = score 
                
                if (depth === this.horizon) {
                    this.searchState.selectedMove = moves[i]
                }
            }

            if (alpha >= beta) {
                Logic.killerTable.push([state, moves[i]], true)
                this.cutoffs += 1
                break
            }
        }

        const newEntry: TranspositionTableEntry = {
            depth: depth,
            value: score,
            flag: TranspositionTableFlag.Exact,
            move: 0
        }

        if (score <= originalAlpha) {
            newEntry.flag = TranspositionTableFlag.UpperBound
        } else if (score >= beta) {
            newEntry.flag = TranspositionTableFlag.LowerBound
        } else {
            if (depth === this.horizon) {
                newEntry.move = this.searchState.selectedMove || 0
            }

            newEntry.flag = TranspositionTableFlag.Exact
        }

        Logic.transpositionTable.push(state, newEntry)

        return alpha
    }
    
}