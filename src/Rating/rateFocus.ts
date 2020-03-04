import { State, Player, Color, Board, Field, Move, Position } from "@henrikthoroe/swc-client";
import Piece, { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";

function findOpponentQueen(board: Board, color: Color): Field | null {
    for (let i = 0; i < 11; ++i) {
        for (let u = 0; u < 11; ++u) {
            const field = board.fields[i][u]
            if (field && field.pieces.findIndex(piece => piece.type === Type.BEE && piece.owner !== color)) {
                return field
            }
        }
    }

    return null
}

function isPosition(obj: Piece | Position): obj is Position {
    return (obj as Position).x !== undefined
}

function findPiece(position: Position, board: Board): Piece | null {
    if (!(board.fields[position.x] && board.fields[position.x][position.y])) {
        return null
    }

    const field = board.fields[position.x][position.y]

    if (field && field.pieces.length > 0) {
        return field.pieces[field.pieces.length - 1]
    }

    return null
}

export default function rateFocus(state: State, player: Color, move: Move): number {
    if (isPosition(move.start)) {
        const piece = findPiece(move.start, state.board)

        if (piece?.type === Type.BEE || piece?.type === Type.GRASSHOPPER) {
            return 1
        }
    }

    const queenPosition = findOpponentQueen(state.board, player)

    if (queenPosition) {
        const distance = Math.sqrt(Math.pow(queenPosition.position.x - move.end.x, 2) + Math.pow(queenPosition.position.y - move.end.y, 2) + Math.pow(queenPosition.position.z - move.end.z, 2))
        
        if ((Math.abs(move.end.x) === 5 || Math.abs(move.end.x) === 5 || Math.abs(move.end.x) === 5) && distance < 2) {
            return 0.1
        }

        if (distance > 2.5) {
            return 0.5
        }
    }

    return 1
}