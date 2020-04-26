import Logic, { SearchResult } from "./Logic"
import Environment from "../utils/Environment"
import { State, Move } from "@henrikthoroe/swc-client"
import { TranspositionTableFlag, TranspositionTableEntry } from "../Cache/createTranspositonTable"
import evaluate from "../Rating/evaluate"
import generateMoves from "../LookAhead/generateMoves"
import simulateMove from "../LookAhead/simulateMove"

/**
 * Not stable yet. Use negascout instead.
 * @see NegaScout
 */
export default class MTDf extends Logic {

    private static addedDepths: number = 0

    private static searches: number = 0

    find(): SearchResult {
        this.searchState.startTime = Date.now()

        let result: number = NaN
        let move: Move | null = null
        let guess = this.firstGuess()

        do {
            const r = this.search(guess, this.availableMoves)
            const m = this.searchState.selectedMove

            if (this.horizon % 2 === 0 && this.initialState.turn % 2 === 0) {
                guess === r
            } 

            if (this.horizon % 2 !== 0 && this.initialState.turn % 2 !== 0) {
                guess = r
            }

            if (!this.didTimeOut()) {
                this.horizon += 1
                result = r
            }

            if (!this.didTimeOut() || r === 200) {
                move = m
            }
        } while (!this.didTimeOut() && this.horizon + this.initialState.turn < 60)

        this.log()

        MTDf.searches += 1
        MTDf.addedDepths += this.horizon

        Environment.debugPrint(`Average Search Depth: ${MTDf.addedDepths / MTDf.searches}, ${this.horizon}`)

        return {
            success: move !== null,
            rating: result,
            value: move,
            timedOut: this.didTimeOut()
        }
    }

    private firstGuess(): number {
        const evaluation = evaluate(this.initialState, this.player.color)
        const increase = Math.pow(2, evaluation.surrounding.opponent) / 2

        return evaluation.value + increase
    }

    private compareFloat(a: number, b: number): boolean {
        return Math.abs(a - b) < 0.0000000001
    }

    private search(firstGuess: number, moves: Move[]): number {
        let guess = firstGuess
        let lowerBound = -Infinity
        let upperBound = Infinity
        let beta: number

        do {
            if (this.compareFloat(guess, lowerBound)) {
                beta = guess + 1
            } else {
                beta = guess
            }

            guess = this.negamax(this.initialState, this.horizon, beta - 1, beta, 1, moves)

            if (guess < beta) {
                upperBound = guess
            } else {
                lowerBound = guess
            }
        } while (lowerBound < upperBound && !this.didTimeOut())

        return guess
    }

    private negamax(state: State, depth: number, alpha: number, beta: number, color: number, availableMoves?: Move[]) {
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

            score = simulateMove(state, moves[i], next => -this.negamax(next, depth - 1, -beta, -alpha, -color))

            // if (i === 0) {
            //     // NegaScout assumes that the first move is the best one
            //     // So it searches it with full with alpha beta window
            //     score = simulateMove(state, moves[i], next => -this.search(next, depth - 1, -beta, -alpha, -color, evaluation, quiescene))
            // } else {
            //     // To create as many cutoffs as possible the following moves are searched with a null window
            //     score = simulateMove(state, moves[i], next => -this.search(next, depth - 1, -alpha - 1, -alpha, -color, evaluation, quiescene))

            //     // If the actual score is not within the assumed window a full alpha beta search is committed
            //     if (alpha < score && score < beta) {
            //         score = simulateMove(state, moves[i], next => -this.search(next, depth - 1, -beta, -score, -color, evaluation, quiescene))
            //     }
            // }

            if (score > alpha) {
                alpha = score 
                
                if (depth === this.horizon) {
                    this.searchState.selectedMove = moves[i]
                }
            }

            if (alpha >= beta) {
                Logic.killerTable.push([state, moves[i]], true)
                // this.cutoffs += 1
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