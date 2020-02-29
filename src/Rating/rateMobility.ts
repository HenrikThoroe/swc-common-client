import { State, Move, Position, fetchMoves, Color, Piece } from '@henrikthoroe/swc-client'
import { Aspect } from '.'
import nextState from '../LookAhead/nextState'
import { comparePositions } from '@henrikthoroe/swc-client/dist/client/Model/Position'
import sig from '../utils/sig'
import cacheHandler from '../Cache'
import simulateMove from '../LookAhead/simulateMove'

function isPosition(obj: Piece | Position): obj is Position {
    return (obj as Position).x !== undefined
}

function rateMoveSet(state: State, moves: Move[]): number {
    const setMoveRating = sig(state.turn / 10, 14, 0.9, 0.5)
    const dragMoveRating = sig(state.turn / 10, -14, 0.9, 0.5)
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
    const ownMoves = fetchMoves(state) 
    const opponentMoves = simulateMove(state, null, next => fetchMoves(next))

    const score = (ownMoves: Move[], opponentMoves: Move[]) => {
        if (ownMoves.length === 0) return 0
        if (opponentMoves.length === 0) return 2

        const score = {
            own: rateMoveSet(state, ownMoves),
            opponent: rateMoveSet(state, opponentMoves)
        }

        if (score.opponent === 0 && score.own !== 0) {
            return 2
        } else if (score.opponent === 0) {
            return 1
        }

        return score.own / score.opponent
    }

    return {
        red: state.currentPlayer === Color.Red ? score(ownMoves, opponentMoves) : score(opponentMoves, ownMoves),
        blue: state.currentPlayer === Color.Blue ? score(ownMoves, opponentMoves) : score(opponentMoves, ownMoves)
    }
}