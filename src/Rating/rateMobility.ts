import { State, Move, Position, fetchMoves, Color, Piece } from '@henrikthoroe/swc-client'
import { foreach, map } from '@henrikthoroe/swc-client/dist/utils'
import createSquareArray from '../utils/createSquareArray'
import sum from '../utils/sum'
import { Aspect } from '.'
import nextState from '../LookAhead/nextState'
import removeOccurences from '../utils/removeOccurences'
import { comparePositions } from '@henrikthoroe/swc-client/dist/client/Model/Position'
import { Type } from '@henrikthoroe/swc-client/dist/client/Model/Piece'
import mapWithCopies from '../utils/mapWithCopies'
import sig from '../utils/sig'

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

function rateMoveSet(state: State, moves: Move[]): number {
    const setMoveRating = sig(state.turn / 60, 14, 0.8, 0.5)
    const dragMoveRating = sig(state.turn / 60, -14, 0.8, 0.5)
    const cache = new Array<Array<number>>(11).fill(new Array<number>(11).fill(0)) // 11x11 array filled with 0

    const finalRating = moves.map(move => {
        const points = isPosition(move.start) ? dragMoveRating : setMoveRating
        const factor = sig(cache[move.end.x + 5][move.end.y + 5] / 4, 14, 0, 0.5)
        return points * factor
    }).reduce((p, c) => p + c)

    return finalRating
}

function rateMove(state: State, move: Move): number {
    const timeFactor = 1 - (60 / state.turn) // The earlier the move the higher the factor

    // ToDo: Base result also on type of piece and position
    if (isPosition(move.start)) {
        const factor = (1 - timeFactor) + 0.8
        return factor <= 1 ? factor : 1
    } else {
        return timeFactor
    }
}

export default function rateMobility(state: State): Aspect {
    const ownMoves = fetchMoves(state) //removeOccurences(fetchMoves(state), (a, b) => comparePositions(a.end, b.end))
    const opponentMoves = fetchMoves(nextState(state)) //removeOccurences(fetchMoves(nextState(state)), (a, b) => comparePositions(a.end, b.end))

    const compareMove = (arg0: Move, arg1: Move) => comparePositions(arg0.end, arg1.end)

    const score = (ownMoves: Move[], opponentMoves: Move[]) => {
        if (ownMoves.length === 0) return 0
        if (opponentMoves.length === 0) return 1

        const score = {
            own: rateMoveSet(state, ownMoves),
            opponent: rateMoveSet(state, opponentMoves)
        }

        // const score = {
        //     own: removeOccurences(ownMoves, compareMove).length,
        //     opponent: removeOccurences(opponentMoves, compareMove).length
        // }

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