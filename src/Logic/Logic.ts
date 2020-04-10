import { State, Move, Player } from '@henrikthoroe/swc-client'
import Rating from '../Rating'
import createTranspositionTable, { TranspositionTableFlag, TranspositionTableEntry } from '../Cache/createTranspositonTable'
import evaluate from '../Rating/evaluate'
import generateMoves from '../LookAhead/generateMoves'
import simulateMove from '../LookAhead/simulateMove'
import createKillerTable from '../Cache/createKillerTable'
import Environment from '../utils/Environment'

export interface SearchResult {
    rating: number
    success: boolean
    timedOut: boolean
    value: Move | null
}

export interface SearchState {
    selectedMove: Move | null
    timedOut: boolean
    startTime: number
    searchedNodes: number
}

/**
 * An abstract class which provides an interface and helper methods for algorythms, 
 * which determine the best possible move for a provided state.
 */
export default abstract class Logic {

    protected horizon: number

    protected searchState: SearchState

    protected readonly initialState: State

    protected readonly timeout: number

    protected readonly availableMoves: Move[]

    protected readonly player: Player

    protected static transpositionTable = createTranspositionTable()

    protected static killerTable = createKillerTable()

    private tempAlpha: number = -Infinity

    constructor(state: State, moves: Move[], player: Player, horizon: number, timeout: number) {
        this.initialState = state
        this.availableMoves = moves 
        this.player = player
        this.horizon = horizon
        this.timeout = timeout
        this.searchState = {
            selectedMove: null,
            timedOut: false,
            startTime: -1,
            searchedNodes: 0
        }
    }

    protected isTerminating(evaluation: Rating, moveCount: number): boolean {
        return evaluation.isGameOver || moveCount === 0 || this.didTimeOut()
    }

    protected didTimeOut(): boolean {
        if (this.searchState.startTime < 0) {
            return true
        }

        return Date.now() - this.searchState.startTime >= this.timeout
    }

    protected log() {
        const time = Date.now() - this.searchState.startTime
        const o = this.searchState.searchedNodes

        Environment.debugPrint(`Performed ${o} operations in ${time} milliseconds [${o / (time / 1000)} op/s][${this.availableMoves.length}][depth: ${this.horizon}].`)
    }

    protected applyKillerHeuristic(state: State, moves: Move[]) {
        let border = 0

        for (let i = 1; i < moves.length; ++i) {
            const cache = Logic.killerTable.read([state, moves[i]])

            if (cache === true) {
                [moves[border], moves[i]] = [moves[i], moves[border]]
                border += 1
            }
        }
    }

    protected readTranspositionTable(state: State, depth: number, alpha: number, beta: number): ["exact" | "alpha" | "beta", number, number, number] |  undefined {
        const entry = Logic.transpositionTable.read(state) 
        this.tempAlpha = alpha

        if (entry && entry.depth >= depth) {
            if (entry.flag === TranspositionTableFlag.Exact) {
                if (entry.depth === this.horizon && typeof(entry.move) !== "number") {
                    if (entry.move === null) {
                        console.warn("Expected the assigned move but found null")
                        return undefined
                    }

                    this.searchState.selectedMove = entry.move
                }

                return ["exact", entry.value, -1, -1]
            } else if (entry.flag === TranspositionTableFlag.LowerBound) {
                return ["alpha", -1, Math.max(alpha, entry.value), -1]
            } else if (entry.flag === TranspositionTableFlag.UpperBound) {
                return ["beta", -1, -1, Math.min(entry.value, beta)]
            }
        }

        return undefined
    }

    protected setTranspositionTable(state: State, score: number, depth: number, beta: number) {
        const newEntry: TranspositionTableEntry = {
            depth: depth,
            value: score,
            flag: TranspositionTableFlag.Exact,
            move: depth === this.horizon ? this.searchState.selectedMove || 0 : 0
        }

        if (score <= this.tempAlpha) {
            newEntry.flag = TranspositionTableFlag.UpperBound
        } else if (score >= beta) {
            newEntry.flag = TranspositionTableFlag.LowerBound
        } else {
            newEntry.flag = TranspositionTableFlag.Exact
        }

        Logic.transpositionTable.push(state, newEntry)
    }

    // protected negamax(state: State, depth: number, alpha: number, beta: number, color: number): number {
    //     const ttResult = this.readTranspositionTable(state, depth, alpha, beta)

    //     if (ttResult) {
    //         const [type, value, ttAlpha, ttBeta] = ttResult

    //         switch (type) {
    //             case "exact":
    //                 if (depth == this.horizon) {
    //                     Environment.debugPrint("well ok that was surprising")
    //                 }
    //                 return value
    //             case "alpha":
    //                 alpha = ttAlpha
    //                 break
    //             case "beta":
    //                 beta = ttBeta
    //                 break
    //         }
    //     }

    //     const evaluation = evaluate(state, this.player.color)
    //     const moves = generateMoves(state)

    //     if (depth === 0 || this.isTerminating(evaluation, moves.length)) {
    //         return evaluation.value * color
    //     }

    //     let value = -Infinity

    //     for (let i = 0; i < moves.length; ++i) {
    //         if (this.didTimeOut()) {
    //             if (depth === this.horizon) {
    //                 Environment.debugPrint(`Timed out after searching ${i} nodes`)
    //             }
    //             break
    //         }

    //         this.searchState.searchedNodes += 1

    //         value = simulateMove(state, moves[i], next => 
    //             Math.max(value, -this.negamax(next, depth - 1, -beta, -alpha, -color))
    //         )

    //         if (value > alpha) {
    //             alpha = value
                
    //             if (depth === this.horizon) {
    //                 this.searchState.selectedMove = moves[i]
    //             }
    //         }

    //         if (alpha >= beta) {
    //             break
    //         }
    //     }

    //     this.setTranspositionTable(state, value, depth, beta)

    //     return value
    // }

    abstract find(): SearchResult
}