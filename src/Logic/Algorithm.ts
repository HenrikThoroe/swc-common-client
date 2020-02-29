import { State, Move, Player, fetchMoves } from '@henrikthoroe/swc-client'
import rate from '../Rating/rate'
import nextState from '../LookAhead/nextState'
import simulateMove from '../LookAhead/simulateMove'

export interface AlgorithmResult {
    rating: number
    success: boolean
    timedOut: boolean
    value: Move | null
}

export default class AlphaBeta {

    readonly timeout: number

    readonly initialState: State

    readonly horizon: number

    readonly availableMoves: Move[]

    readonly player: Player

    private selectedMove: Move | null = null

    private start: number = -1

    private timedOut: boolean = false

    private operations: number = 0

    private randomTable: number[]

    private lookupIndex = 0

    constructor(state: State, moves: Move[], player: Player, horizon: number, timeout: number) {
        this.initialState = state
        this.availableMoves = moves
        this.horizon = horizon > 0 ? horizon : 1
        this.timeout = timeout > 0 ? timeout : 0
        this.player = player
        this.randomTable = []

        for (let i = 0; i < 50; ++i) {
            this.randomTable.push(Math.random())
        }
    }

    findBest(): AlgorithmResult {
        this.start = Date.now()

        const alpha = -Infinity
        const beta = Infinity
        const rating = this.max(this.initialState, this.availableMoves, this.horizon, alpha, beta)

        // avg 300
        console.log(`Performed ${this.operations} operations in ${this.timeout} milliseconds [${this.operations / (this.timeout / 1000)} op/s].`)

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

        return Date.now() - this.start >= this.timeout
    }

    private max(state: State, moves: Move[], depth: number, alpha: number, beta: number): number {
        if (depth === 0) {
            return rate(state, this.player.color)
        }

        let max = alpha
        let c = 0
        let move: Move

        for (let i = 0; i < moves.length; ++i) {
            move = moves[i]
            c += 1

            if (this.hasTimedOut) {
                this.timedOut = true

                if (depth === this.horizon) {
                    console.log(`Timed out after searching ${c} of ${moves.length} branches.`)
                }
                break
            }
 
            this.operations += 1
            const rating = simulateMove(state, move, next => {
                return depth === 0 ? rate(next, this.player.color) : this.min(next, fetchMoves(next), depth - 1, max, beta)
            })
            
            if (rating > max) {
                max = rating
                
                if (depth === this.horizon) {
                    this.selectedMove = move
                }
            }
    
            // Bring some random in to prevent opponent from finding some sort of pattern
            if (rating === max && this.random() > 0.5 && depth === this.horizon) {
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
        let move: Move

        for (let i = 0; i < moves.length; ++i) {
            move = moves[i]

            if (this.hasTimedOut) {
                this.timedOut = true
                break
            }

            this.operations += 1
            const rating = simulateMove(state, move, next => {
                return this.max(next, fetchMoves(next), depth - 1, alpha, min)
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

    private sort(moves: Move[], state: State, descending: boolean): Move[] {
        const moveMap = moves.map(move => ({ move: move, rating: simulateMove(state, move, next => rate(next, this.player.color)) }))
        return moveMap.sort((a, b) => descending ? b.rating - a.rating : a.rating - b.rating).map(a => a.move)
    }

    private random(): number {
        return this.lookupIndex >= this.randomTable.length ? this.randomTable[this.lookupIndex = 0] : this.randomTable[this.lookupIndex]
    }

}