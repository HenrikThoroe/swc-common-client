import connect, { Move, Color, fetchMoves, State } from '@henrikthoroe/swc-client'
import nextState from './LookAhead/nextState'
import rate from './Rating/rate'
import conclude from './Rating/conclude'
import { foreach } from '@henrikthoroe/swc-client/dist/utils'
import yargs from 'yargs'
import Piece, { Type } from '@henrikthoroe/swc-client/dist/client/Model/Piece'

const args = yargs
    .option("host", {
        alias: "h",
        type: "string"
    })
    .option("port", {
        alias: "p",
        type: "number"
    })
    .option("reservation", {
        alias: "r",
        type: "string"
    })
    .parse()

    console.log(args)

connect({ host: args.host || "localhost", port: args.port || 13050, joinOptions: { rc: args.reservation } }, (state, undeployed, player, available) => {
    if (available.length === 0) {
        console.log(fetchMoves(state).length)
        throw new Error("No available moves") // send missmove
    }

    if (state.undeployed.red.findIndex(p => p.type === Type.BEE && p.owner === player.color) !== -1) {
        available = available.filter(move => {
            if ((move.start as Piece).type) {
                return (move.start as Piece).type === Type.BEE
            }

            return false
        })

        return available[Math.floor(Math.random() * available.length)]
    }

    let selectedMove: Move | null = null
    const horizon = 5
    const time = () => Date.now()
    const start = time()
    const timeout = 1990

    const name = (color: Color) => {
        return color === Color.Red ? "Red" : "Blue"
    }

    const max = (depth: number, state: State, moves: Move[], alpha: number, beta: number) => {
        if (depth === 0 || moves.length === 0) {
            // console.log(`Rating max ${name(state.currentPlayer)}`)
            return rate(state, player.color)
        }

        let max = alpha

        for (const move of moves) {

            if (time() - start > timeout) {
                break
            }
            
            const next = nextState(state, move)
            const value = min(depth - 1, next, fetchMoves(state), max, beta)

            if (value > max) {
                max = value

                if (depth === horizon) {
                    selectedMove = move
                }

                if (max >= beta) {
                    break
                }
            }
        }

        return max
    }

    const min = (depth: number, state: State, moves: Move[], alpha: number, beta: number) => {
        if (depth === 0 || moves.length === 0) {
            // console.log(`Rating min ${name(state.currentPlayer)}`)
            return rate(state, player.color)
        }

        let min = beta

        for (const move of moves) {

            if (time() - start > timeout) {
                break
            }

            const next = nextState(state, move)
            const value = max(depth - 1, next, fetchMoves(state), alpha, min)

            if (value < min) {
                min = value

                if (depth === horizon) {
                    selectedMove = move
                }

                if (min <= alpha) {
                    break
                }
            }
        }

        return min
    }

    const alphaBeta = (depth: number, state: State, moves: Move[], alpha: number, beta: number): number => {
        if (depth === 0 || moves.length === 0) {
            return rate(state, player.color)
        }

        let maxValue = alpha


        for (let i = 0; i < moves.length; ++i) {
            const next = nextState(state, moves[i])
            const nextMoves = fetchMoves(next)
            const value = -alphaBeta(depth - 1, next, nextMoves, -beta, -maxValue)

            if (value > maxValue) {
                maxValue = value
                if (depth === horizon) {
                    selectedMove = moves[i]
                }
                if (maxValue >= beta) {
                    break
                }
            }
        }

        return maxValue
    }

    console.time()
    // console.log(alphaBeta(horizon, state, available, -Infinity, Infinity))
    console.log(max(horizon, state, available, -Infinity, Infinity))
    console.timeEnd()

    return selectedMove || available[Math.floor(Math.random() * available.length)]
})
.catch(error => {
    console.error(error)
})

// function openingMove(moves: Move[]): Move {
//     let min = moves[0]

//     for (const move of moves) {
        
//     }
// }


// function minmax(state: State, depth: number,  selectedMove: { move?: Move }): number {
//     const moves = fetchMoves(state)
//     let max = -Infinity

//     if (moves.length === 0 || depth === 0) {
//         return conclude(rate(state, moves))
//     }

//     while (moves.length > 0) {
//         const move =  moves.pop()!
//         const next  = nextState(state, move)
//         const rating = -minmax(next, depth - 1, selectedMove)

//         if (rating > max) {
//             max = rating
//             selectedMove.move = move
//         }
//     }

//     return max
// }