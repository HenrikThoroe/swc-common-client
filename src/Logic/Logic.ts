import { State, Move, Player } from '@henrikthoroe/swc-client'
import Rating from '../Rating'
import createTranspositionTable from '../Cache/createTranspositonTable'

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

    abstract find(): SearchResult
}