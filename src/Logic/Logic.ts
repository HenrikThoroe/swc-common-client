import { State, Move, Player } from '@henrikthoroe/swc-client'
import Rating from '../Rating'
import createTranspositionTable, { TranspositionTableFlag, TranspositionTableEntry } from '../Cache/createTranspositonTable'
import evaluate from '../Rating/evaluate'
import generateMoves from '../LookAhead/generateMoves'
import simulateMove from '../LookAhead/simulateMove'

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

        console.log(`Performed ${o} operations in ${time} milliseconds [${o / (time / 1000)} op/s][${this.availableMoves.length}][depth: ${this.horizon}].`)
    }

    protected negamax(state: State, depth: number, alpha: number, beta: number, color: number): number {
        const entry = Logic.transpositionTable.read(state) 
        const originalAlpha = alpha

        if (entry && entry.depth >= depth) {
            if (entry.flag === TranspositionTableFlag.Exact) {
                return entry.value
            } else if (entry.flag === TranspositionTableFlag.LowerBound) {
                alpha = Math.max(alpha, entry.value)
            } else if (entry.flag === TranspositionTableFlag.UpperBound) {
                beta = Math.min(entry.value, beta)
            }
        }

        const evaluation = evaluate(state, this.player.color)
        const moves = generateMoves(state)

        if (depth === 0 || this.isTerminating(evaluation, moves.length)) {
            return evaluation.value * color
        }

        let value = -Infinity

        for (let i = 0; i < moves.length; ++i) {
            if (this.didTimeOut()) {
                if (depth === this.horizon) {
                    console.log(`Timed out after searching ${i} nodes`)
                }
                break
            }

            this.searchState.searchedNodes += 1

            value = simulateMove(state, moves[i], next => 
                Math.max(value, -this.negamax(next, depth - 1, -beta, -alpha, -color))
            )

            if (value > alpha) {
                alpha = value
                
                if (depth === this.horizon) {
                    this.searchState.selectedMove = moves[i]
                }
            }

            if (alpha >= beta) {
                break
            }
        }

        const newEntry: TranspositionTableEntry = {
            depth: depth,
            value: value,
            flag: TranspositionTableFlag.Exact
        }

        if (value <= originalAlpha) {
            newEntry.flag = TranspositionTableFlag.UpperBound
        } else if (value >= beta) {
            newEntry.flag = TranspositionTableFlag.LowerBound
        } else {
            newEntry.flag = TranspositionTableFlag.Exact
        }

        Logic.transpositionTable.push(state, newEntry)

        return value
    }

    abstract find(): SearchResult
}