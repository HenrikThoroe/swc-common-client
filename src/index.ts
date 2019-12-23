import connect, { Move, Color, fetchMoves, State } from '@henrikthoroe/swc-client'
import nextState from './LookAhead/nextState'
import rate from './Rating/rate'
import conclude from './Rating/conclude'

connect({ host: "localhost", port: 13050 }, (state, undeployed, player, available) => {
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


function minmax(state: State, depth: number,  selectedMove: { move?: Move }): number {
    console.time("Moves")
    const moves = fetchMoves(state)
    console.timeEnd("Moves")
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