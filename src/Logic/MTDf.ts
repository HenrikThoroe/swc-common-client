import Logic, { SearchResult } from "./Logic"
import Environment from "../utils/Environment"
import { State, Move, Player } from "@henrikthoroe/swc-client"
import { TranspositionTableFlag, TranspositionTableEntry } from "../Cache/createTranspositonTable"
import evaluate from "../Rating/evaluate"
import generateMoves from "../LookAhead/generateMoves"
import simulateMove from "../LookAhead/simulateMove"

/**
 * Not stable yet. Use negascout instead.
 * @see NegaScout
 */
export default class MTDf extends Logic {

    private firstGuess: number

    private static addedDepths: number = 0

    private static searches: number = 0

    constructor(state: State, moves: Move[], player: Player, horizon: number, timeout: number, firstGuess: number) {
        super(state, moves, player, horizon, timeout)
        this.firstGuess = firstGuess
    }

    find(): SearchResult {
        this.searchState.startTime = Date.now()

        let result: number = NaN
        let move: Move | null = null
        let guess = this.firstGuess

        do {
            const r = this.search(guess, this.availableMoves)
            const m = this.searchState.selectedMove

            if (!this.didTimeOut()) {
                this.horizon += 1
                result = r
            }

            if (!this.didTimeOut() || r === 200) {
                move = m
            }

            guess = r
        } while (!this.didTimeOut())

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

    private compareFloat(a: number, b: number): boolean {
        // Environment.debugPrint("Is Equal: ", a, b, Math.abs(a - b) < 0.0000001)
        return Math.abs(a - b) < 0.0000001
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

            guess = this.negamax(this.initialState, 1, this.horizon, beta - 1, beta)

            if (guess < beta) {
                upperBound = guess
            } else {
                lowerBound = guess
            }
        } while (lowerBound < upperBound && !this.didTimeOut())

        return guess
    }

    private negamax(state: State, color: number, depth: number, alpha: number, beta: number, availableMoves?: Move[]) {
        const entry = Logic.transpositionTable.read(state) 
        const originalAlpha = alpha

        if (entry && entry.depth >= depth) {
            if (entry.flag === TranspositionTableFlag.Exact) {
                let ignore = false

                if (entry.depth === depth && depth === this.horizon) {
                    if (typeof(entry.move) !== "number") {
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


        const evaluation = evaluate(state, this.player.color)
        const moves = availableMoves ? availableMoves : generateMoves(state)

        if (evaluation.isGameOver || this.didTimeOut() || moves.length === 0 || depth === 0) {
            // console.log("Return", depth, moves.length, evaluation.isGameOver, this.didTimeOut())
            return evaluation.value * color
        }

        let score: number = 0

        this.applyKillerHeuristic(state, moves)

        for (let i = 0; i < moves.length; ++i) {
            this.searchState.searchedNodes += 1

            if (this.didTimeOut()) {
                if (depth === this.horizon) Environment.debugPrint(`Timed out after searching ${i + 1} of ${moves.length} nodes. Depth: ${this.horizon}`)
                break
            }

            score = simulateMove(state, moves[i], next => -this.negamax(next, -color, depth - 1, -beta, -score))

            if (score > alpha) {
                alpha = score 
                
                if (depth === this.horizon) {
                    this.searchState.selectedMove = moves[i]
                }
            }

            if (alpha >= beta) {
                Logic.killerTable.push([state, moves[i]], true)
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