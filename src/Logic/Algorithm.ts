import { State, Move, Player, fetchMoves } from '@henrikthoroe/swc-client'
import rate from '../Rating/rate'
import nextState from '../LookAhead/nextState'

export interface AlgorithmResult {
    rating: number
    success: boolean
    timedOut: boolean
    value: Move | null
}

export default class Algorithm {

    readonly timout: number

    readonly initialState: State

    readonly horizon: number

    readonly availableMoves: Move[]

    readonly player: Player

    private selectedMove: Move | null = null

    private start: number = -1

    private timedOut: boolean = false

    constructor(state: State, moves: Move[], player: Player, horizon: number, timeout: number) {
        this.initialState = state
        this.availableMoves = moves
        this.horizon = horizon > 0 ? horizon : 1
        this.timout = timeout > 0 ? timeout : 0
        this.player = player
    }

    findBest(): AlgorithmResult {
        this.start = Date.now()

        const alpha = -Infinity
        const beta = Infinity
        const rating = this.max(this.initialState, this.availableMoves, this.horizon, alpha, beta)

        return {
            rating: rating,
            success: this.selectedMove !== null,
            timedOut: this.timedOut,
            value: this.selectedMove
        }
    }

    private get hasTimedOut(): boolean {
        if (this.start < 0) {
            return true
        }

        return Date.now() - this.start >= this.timout
    }

    private max(state: State, moves: Move[], depth: number, alpha: number, beta: number): number {
        if (depth === 0) {
            return rate(state, this.player.color)
        }

        let max = alpha

        for (const move of moves) {
            if (this.hasTimedOut) {
                this.timedOut = true
                break
            }
 
            const next = nextState(state, move)
            const rating = depth === 0 ? rate(next, this.player.color) : this.min(next, fetchMoves(next), depth - 1, max, beta)
            
            if (rating > max) {
                max = rating
                
                if (depth === this.horizon) {
                    this.selectedMove = move
                }
            }
    
            // Bring some random in to prevent opponent from finding some sort of schema
            if (rating === max && Math.random() > 0.5 && depth === this.horizon) {
                this.selectedMove = move
            }

            if (max >= beta) {
                break
            }
        }

        return max
    }

    private min(state: State, moves: Move[], depth: number, alpha: number, beta: number): number {
        if (depth === 0) {
            return rate(state, this.player.color)
        }

        let min = beta

        for (const move of moves) {
            if (this.hasTimedOut) {
                this.timedOut = true
                break
            }

            const next = nextState(state, move)
            const rating = this.max(next, fetchMoves(next), depth - 1, alpha, min)
            
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