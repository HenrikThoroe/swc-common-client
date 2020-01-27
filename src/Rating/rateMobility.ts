import { State, Move, Position, fetchMoves, Color } from '@henrikthoroe/swc-client'
import { foreach, map } from '@henrikthoroe/swc-client/dist/utils'
import createSquareArray from '../utils/createSquareArray'
import sum from '../utils/sum'
import { Aspect } from '.'
import nextState from '../LookAhead/nextState'

// export default function rateMobility(state: State, moves: Move[]): number {
//     const points = {
//         setMove: 1.1,
//         dragMove: 1,
//         multipleOptionsFactor: 0.8
//     }

//     const routes = createSquareArray(11, 0)

//     foreach(moves, move => {
//         const idx0 = move.end.x + 5
//         const idx1 = move.end.y + 5
//         const basePoints = ((move.start as Position).x !== undefined) ? points.dragMove : points.setMove
        
//         if (routes[idx0][idx1] === 0) {
//             routes[idx0][idx1] = basePoints
//         } else {
//             routes[idx0][idx1] += basePoints * points.multipleOptionsFactor
//         }
//     })

//     return sum(map(routes, v => sum(v)))
// }

export default function rateMobility(state: State): Aspect {
    const ownMoves = fetchMoves(state)
    const opponentMoves = fetchMoves(nextState(state))

    // console.log("Moves", ownMoves.length, opponentMoves.length)

    const score = (ownMoves: number, opponentMoves: number) => {
        if (ownMoves === 0) return -1000
        if (opponentMoves === 0) return 1000

        return ownMoves / opponentMoves
    }

    return {
        red: state.currentPlayer === Color.Red ? score(ownMoves.length, opponentMoves.length) : score(opponentMoves.length, ownMoves.length),
        blue: state.currentPlayer === Color.Blue ? score(ownMoves.length, opponentMoves.length) : score(opponentMoves.length, ownMoves.length)
    }
}