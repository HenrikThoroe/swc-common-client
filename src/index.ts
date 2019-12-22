import connect, { Move } from '@henrikthoroe/swc-client'
import nextState from './LookAhead/nextState'
import rate from './Rating/rate'
import conclude from './Rating/conclude'

connect({ host: "localhost", port: 13050 }, (state, undeployed, player, available) => {
    if (available.length === 0) {
        throw new Error("No available moves")
    }
    console.time("Calc")
    let bestMove: { move: Move, rating: number } = { move: available[0], rating: -Infinity }

    for (const move of available) {
        const next = nextState(state, move)
        const rating = rate(next)
        const conclusion = -conclude(rating)

        if (conclusion > bestMove.rating) {
            bestMove = { move: move, rating: conclusion }
        }
    }
    console.timeEnd("Calc")
    return bestMove.move
})
.catch(error => {
    console.error(error)
})