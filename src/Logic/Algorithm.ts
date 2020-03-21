import { State, Move, Player, fetchMoves } from '@henrikthoroe/swc-client'
import rate from '../Rating/rate'
import nextState from '../LookAhead/nextState'
import simulateMove from '../LookAhead/simulateMove'
import generateMoves from '../LookAhead/generateMoves'

export interface AlgorithmResult {
    rating: number
    success: boolean
    timedOut: boolean
    value: Move | null
}

export default class AlphaBeta {

    readonly timeout: number

    readonly initialState: State

    horizon: number

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

        let alpha: number = -Infinity
        let beta: number = Infinity
        let rating: number = NaN

        while (!this.timedOut) {
            const res = this.max(this.initialState, this.availableMoves, this.horizon, alpha, beta, 0)
            this.horizon += 1

            if (!this.timedOut || this.hasTimedOut || isNaN(rating) || res === 200) {
                rating = res
            }

            if (this.hasTimedOut) {
                break
            }
        }

        
        const time = Date.now() - this.start
        console.log(`Performed ${this.operations} operations in ${time} milliseconds [${this.operations / (time / 1000)} op/s][${this.availableMoves.length}][depth: ${this.horizon}].`)

        return {
            rating: rating,
            success: this.selectedMove !== null,
            timedOut: this.timedOut,
            value: this.selectedMove
        }
    }

    // private mtdf(guess: number) {
    //     let g = guess
    //     let upperBound = Infinity
    //     let lowerBound = -Infinity

    //     while (lowerBound < upperBound) {
    //         let beta = Math.max(lowerBound + 1, g)
    //         g = this.max(this.initialState, this.availableMoves, this.horizon, beta - 1, beta)

    //         if (g < beta) {
    //             upperBound = g
    //         } else {
    //             lowerBound = g
    //         }
    //     }

    //     return g
    // }

    private get hasTimedOut(): boolean {
        if (this.start < 0) {
            return true
        }

        return Date.now() - this.start >= this.timeout
    }

    private negaScout(state: State, depth: number, alpha: number, beta: number, color: number): number {
        const evaluation = rate(state, this.player.color)

        if (depth === this.horizon || evaluation.isGameOver) {
            return evaluation.value * color
        }

        const moves = generateMoves(state)
        let score: number = 0

        for (let i = 0; i < moves.length; ++i) {
            if (i === 0) {
                score = simulateMove(state, moves[i], next => -this.negaScout(next, depth - 1, -beta, -alpha, -color))
            } else {
                score = simulateMove(state, moves[i], next => -this.negaScout(next, depth - 1, -alpha - 1, -alpha, -color))

                if (alpha < score && score < beta) {
                    score = simulateMove(state, moves[i], next => -this.negaScout(next, depth - 1, -beta, -score, -color))
                }
            }

            alpha = Math.max(score, alpha)

            if (alpha >= beta) {
                break
            }
        }

        return alpha

    }

    private max(state: State, moves: Move[], depth: number, alpha: number, beta: number, previous: number): number {
        const evaluation = rate(state, this.player.color)

        if (evaluation.isGameOver || this.hasTimedOut) {
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

            if (this.hasTimedOut) {
                this.timedOut = true

                if (depth === this.horizon) {
                    console.log(`Timed out after searching ${c} of ${moves.length} nodes.`)
                }
                break
            }
 
            this.operations += 1
            const rating = simulateMove(state, move, next => {
                return this.min(next, generateMoves(next), depth - 1, max, beta, evaluation.value)
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

    private min(state: State, moves: Move[], depth: number, alpha: number, beta: number, previous: number): number {
        const evaluation = rate(state, this.player.color)

        if (evaluation.isGameOver || this.hasTimedOut) {
            return evaluation.value
        }

        if (depth === 0) {
            return evaluation.value
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
                return this.max(next, generateMoves(next), depth - 1, alpha, min, evaluation.value)
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

    private random(): number {
        return this.lookupIndex >= this.randomTable.length ? this.randomTable[this.lookupIndex = 0] : this.randomTable[this.lookupIndex]
    }

}