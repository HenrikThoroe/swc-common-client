import connect, { Move, Color, fetchMoves, State } from '@henrikthoroe/swc-client'
import nextState from './LookAhead/nextState'
import rate from './Rating/rate'
import conclude from './Rating/conclude'
import { foreach } from '@henrikthoroe/swc-client/dist/utils'
import yargs from 'yargs'
import Piece, { Type } from '@henrikthoroe/swc-client/dist/client/Model/Piece'

const args = yargs
    .alias("h", "host")
    .alias("p", "port")
    .alias("r", "reservation")
    .string("host")
    .number("port")
    .string("reservation")
    .parse()

connect({ host: args.host || "localhost", port: args.port || 13050, joinOptions: { rc: args.reservation } }, (state, undeployed, player, available) => {
    if (available.length === 0) {
        throw new Error("No available moves")
    }

    if (state.undeployed.red.findIndex(p => p.type === Type.BEE && p.owner === Color.Red) !== -1) {
        available = available.filter(move => {
            if ((move.start as Piece).type) {
                return (move.start as Piece).type === Type.BEE
            }

            return false
        })
    }

    let max: Move | null = null
    let maxrating = -Infinity
    const depth = 3

    const algo = (i: number, currentState: State, moves: Move[]) => {
        if (i >= depth) {
            return
        }

        for (const move of moves) {
            const next = nextState(currentState, move)
            const rating = rate(next, player.color)
    
            if (rating > maxrating) {
                max = move
                maxrating = rating
            }

            algo(++i, next, fetchMoves(next))
        }
    }

    algo(0, state, available)

    console.log(maxrating)

    return max!
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