import { State, Move, Position, fetchMoves, Color, Piece } from '@henrikthoroe/swc-client'
import { Aspect } from '.'
import nextState from '../LookAhead/nextState'
import { comparePositions } from '@henrikthoroe/swc-client/dist/client/Model/Position'
import sig from '../utils/sig'

function isPosition(obj: Piece | Position): obj is Position {
    return (obj as Position).x !== undefined
}

function rateMoveSet(state: State, moves: Move[]): number {
    const setMoveRating = sig(state.turn / 60, 14, 0.8, 0.5)
    const dragMoveRating = sig(state.turn / 60, -14, 0.8, 0.5)
    const cache = new Array<Array<number>>(11).fill(new Array<number>(11).fill(0)) // 11x11 array filled with 0

    const finalRating = moves
        .map(move => {
            const importance = isPosition(move.start) ? dragMoveRating : setMoveRating
            const countFactor = sig(cache[move.end.x + 5][move.end.y + 5] / 4, 14, 0, 0.5)

            cache[move.end.x + 5][move.end.y + 5] += 1

            return importance * countFactor
        })
        .reduce((p, c) => p + c)

    return finalRating
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