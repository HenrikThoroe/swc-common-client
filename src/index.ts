import connect, { Move, Color, fetchMoves, State } from '@henrikthoroe/swc-client'
import nextState from './LookAhead/nextState'
import rate from './Rating/rate'
import conclude from './Rating/conclude'
import { foreach } from '@henrikthoroe/swc-client/dist/utils'
import yargs from 'yargs'

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
    console.time("Calc")
    // let bestMove: { move: Move, rating: number } = { move: available[0], rating: -Infinity }

    // for (const move of available) {
    //     const next = nextState(state, move)
    //     const rating = rate(next)
    //     const conclusion = -conclude(rating)

    //     if (conclusion > bestMove.rating) {
    //         bestMove = { move: move, rating: conclusion }
    //     }
    // }
    const selected: { move?: Move } = {}
    minmax(state, state.turn === 0 ? 1 : 4, selected)

    console.timeEnd("Calc")
    return selected.move!
})
.catch(error => {
    console.error(error)
})

// function openingMove(moves: Move[]): Move {
//     let min = moves[0]

//     for (const move of moves) {
        
//     }
// }


function minmax(state: State, depth: number,  selectedMove: { move?: Move }): number {
    const moves = fetchMoves(state)
    let max = -Infinity

    if (moves.length === 0 || depth === 0) {
        return conclude(rate(state, moves))
    }

    while (moves.length > 0) {
        const move =  moves.pop()!
        const next  = nextState(state, move)
        const rating = -minmax(next, depth - 1, selectedMove)

        if (rating > max) {
            max = rating
            selectedMove.move = move
        }
    }

    return max
}