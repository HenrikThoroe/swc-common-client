import { State, Move, Position, fetchMoves, Color, Piece } from '@henrikthoroe/swc-client'
import { foreach, map } from '@henrikthoroe/swc-client/dist/utils'
import createSquareArray from '../utils/createSquareArray'
import sum from '../utils/sum'
import { Aspect } from '.'
import nextState from '../LookAhead/nextState'
import removeOccurences from '../utils/removeOccurences'
import { comparePositions } from '@henrikthoroe/swc-client/dist/client/Model/Position'
import { Type } from '@henrikthoroe/swc-client/dist/client/Model/Piece'

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

function isPosition(obj: Piece | Position): obj is Position {
    return (obj as Position).x !== undefined
}

export default function rateMobility(state: State): Aspect {
    const ownMoves = removeOccurences(fetchMoves(state), (a, b) => comparePositions(a.end, b.end))
    const opponentMoves = removeOccurences(fetchMoves(nextState(state)), (a, b) => comparePositions(a.end, b.end))

    const score = (ownMoves: Move[], opponentMoves: Move[]) => {
        if (ownMoves.length === 0) return 0
        if (opponentMoves.length === 0) return 1

        const score = {
            own: ownMoves.length,
            opponent: opponentMoves.length
        }

        // for (const move of ownMoves) {
        //     if (!isPosition(move.start)) {
        //         switch (move.start.type) {
        //             case Type.ANT:
        //                 break
        //             case Type.BEE:
        //                 break 
        //             case Type.BEETLE:
        //                 break
        //             case Type.GRASSHOPPER:
        //                 break
        //             case Type.SPIDER:
        //                 break
        //         }
        //     }
        // }

        return score.own / score.opponent
    }

    return {
        red: state.currentPlayer === Color.Red ? score(ownMoves, opponentMoves) : score(opponentMoves, ownMoves),
        blue: state.currentPlayer === Color.Blue ? score(ownMoves, opponentMoves) : score(opponentMoves, ownMoves)
    }
}