import { State, Move, Position, fetchMoves, Color, Piece, Board } from '@henrikthoroe/swc-client'
import { Aspect } from '.'
import nextState from '../LookAhead/nextState'
import { comparePositions } from '@henrikthoroe/swc-client/dist/client/Model/Position'
import sig from '../utils/sig'
import cacheHandler from '../Cache'
import simulateMove from '../LookAhead/simulateMove'
import rateFocus from './rateFocus'
import generateMoves from '../LookAhead/generateMoves'
import { Type } from '@henrikthoroe/swc-client/dist/client/Model/Piece'
import isDraggable from '@henrikthoroe/swc-client/dist/client/Worker/Moves/isDraggable'

function isPosition(obj: Piece | Position): obj is Position {
    return (obj as Position).x !== undefined
}

function rateMoveSet(state: State, moves: Move[], player: Color): number {
    const setMoveRating = sig(state.turn / 8, 14, 0.8, 0.5)
    const dragMoveRating = sig(state.turn / 8, -14, 0.8, 0.5)
    const cache = new Array<Array<number>>(11).fill(new Array<number>(11).fill(0)) // 11x11 array filled with 0

    let finalRating = moves
        .map(move => {
            const importance = isPosition(move.start) ? dragMoveRating : setMoveRating
            const countFactor = sig(cache[move.end.x + 5][move.end.y + 5] / 2, 14, 0, 0.5)

            cache[move.end.x + 5][move.end.y + 5] += 1

            return importance * countFactor * rateFocus(state, player, move)
        }) 
        .reduce((p, c) => p + c)

    // const queen = queenPosition(state.board, player === Color.Blue ? Color.Red : Color.Blue)
    
    // if (queen && !isDraggable(state, queen)) {
    //     finalRating += 100
    // }

    return finalRating
}

function queenPosition(board: Board, owner: Color): Position | null {
    for (let x = 0; x < 11; ++x) {
        let group = board.fields[x]

        if (group === undefined || group.length < 11) {
            continue
        }

        for (let y = 0; y < 11; ++y) {
            if (board.fields[x][y] === undefined) {
                break
            }

            if (board.fields[x][y].pieces.findIndex(piece => piece.owner === owner && piece.type === Type.BEE)) {
                return board.fields[x][y].position
            }
        }
    }

    return null
}

export default function rateMobility(state: State, moves?: Move[]): Aspect {
    const ownMoves = moves ? moves : generateMoves(state) 
    const opponentMoves = simulateMove(state, null, next => generateMoves(next))

    const score = (ownMoves: Move[], opponentMoves: Move[]) => {
        if (ownMoves.length === 0) return 0
        if (opponentMoves.length === 0) return 1024

        const score = {
            own: rateMoveSet(state, ownMoves, state.currentPlayer),
            opponent: rateMoveSet(state, opponentMoves, state.currentPlayer === Color.Blue ? Color.Red : Color.Blue)
        }

        if (score.opponent === 0 && score.own !== 0) {
            return 1024
        } else if (score.opponent === 0) {
            return 512
        }

        return score.own / score.opponent
    }

    const ownScore = score(ownMoves, opponentMoves)
    const opponentScore = score(opponentMoves, ownMoves)

    return {
        red: state.currentPlayer === Color.Red ? ownScore : opponentScore,
        blue: state.currentPlayer === Color.Blue ? ownScore : opponentScore
    }
}