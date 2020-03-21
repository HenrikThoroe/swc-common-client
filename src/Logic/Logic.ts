import { State, Move, Player } from '@henrikthoroe/swc-client'
import rate from '../Rating/rate'
import simulateMove from '../LookAhead/simulateMove'
import generateMoves from '../LookAhead/generateMoves'

export interface AlgorithmResult {
    rating: number
    success: boolean
    timedOut: boolean
    value: Move | null
}

/**
 * Use this class to find the best possible move of an passed state. 
 * It acts as a general interface for different algorythms and heuristics.
 */
export default class Logic {

    horizon: number

    readonly timeout: number

    readonly initialState: State

    readonly availableMoves: Move[]

    readonly player: Player

    private selectedMove: Move | null = null

    private start: number = -1

    private timedOut: boolean = false

    private operations: number = 0

    constructor(state: State, moves: Move[], player: Player, horizon: number, timeout: number) {
        this.initialState = state
        this.availableMoves = moves
        this.horizon = horizon > 0 ? horizon : 1
        this.timeout = timeout > 0 ? timeout : 0
        this.player = player
    }

    findBest(): AlgorithmResult {
        this.start = Date.now()

        let alpha: number = -Infinity
        let beta: number = Infinity
        let rating: number = this.negaScout(this.initialState, this.horizon, alpha, beta, 1) //NaN

        // while (!this.timedOut) {
        //     const res = this.max(this.initialState, this.availableMoves, this.horizon, alpha, beta, 0)
        //     this.horizon += 1

        //     if (!this.timedOut || this.hasTimedOut || isNaN(rating) || res === 200) {
        //         rating = res
        //     }

        //     if (this.hasTimedOut) {
        //         break
        //     }
        // }

        
        const time = Date.now() - this.start
        console.log(`Performed ${this.operations} operations in ${time} milliseconds [${this.operations / (time / 1000)} op/s][${this.availableMoves.length}][depth: ${this.horizon}].`)

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

    private negaScout(state: State, depth: number, alpha: number, beta: number, color: number): number {
        const evaluation = rate(state, this.player.color)

        if (depth === 0 || evaluation.isGameOver || this.hasTimedOut) {
            return evaluation.value * color
        }

        const moves = generateMoves(state)
        let score: number = 0

        for (let i = 0; i < moves.length; ++i) {
            this.operations += 1
            if (i === 0) {
                score = simulateMove(state, moves[i], next => -this.negaScout(next, depth - 1, -beta, -alpha, -color))
            } else {
                score = simulateMove(state, moves[i], next => -this.negaScout(next, depth - 1, -alpha - 1, -alpha, -color))

                if (alpha < score && score < beta) {
                    score = simulateMove(state, moves[i], next => -this.negaScout(next, depth - 1, -beta, -score, -color))
                }
            }

            if (score > alpha) {
                alpha = score 
                
                if (depth === this.horizon) {
                    this.selectedMove = moves[i]
                }
            }

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
            if (rating === max && Math.random() > 0.5 && depth === this.horizon) {
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

}