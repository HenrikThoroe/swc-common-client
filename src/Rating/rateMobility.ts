import { State, Move, Position, fetchMoves, Color, Piece, Board } from '@henrikthoroe/swc-client'
import { Aspect } from '.'
import isDraggable from '@henrikthoroe/swc-client/dist/client/Worker/Moves/isDraggable'
import enumerateBoard from '../utils/enumerateBoard'

function isPosition(obj: Piece | Position): obj is Position {
    return (obj as Position).x !== undefined
}

export default function rateMobility(state: State): Aspect {
    const rateUndeployed = (pieces: Piece[]) => 1 - (pieces.length / 11)
    const rateDraggable = (color: Color) => {
        let draggable = 0

        enumerateBoard(state.board, field => {
            const pieces = field.pieces
            const piece = pieces[pieces.length - 1]

            if (pieces.length > 0 && piece.owner === color && isDraggable(state, field.position)) {
                draggable += 1
            }
        })

        return draggable / 11
    }

    return {
        red: (rateUndeployed(state.undeployed.red) + rateDraggable(Color.Red)) / 2, 
        blue: (rateUndeployed(state.undeployed.blue) + rateDraggable(Color.Blue)) / 2
    }
}