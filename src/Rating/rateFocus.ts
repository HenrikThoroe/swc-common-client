import { State, Player, Color, Board, Field, Move } from "@henrikthoroe/swc-client";
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";

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

export default function rateFocus(state: State, player: Color, move: Move): number {
    const queenPosition = findOpponentQueen(state.board, player)

    if (queenPosition) {
        const distance = Math.sqrt(Math.pow(queenPosition.position.x - move.end.x, 2) + Math.pow(queenPosition.position.y - move.end.y, 2) + Math.pow(queenPosition.position.z - move.end.z, 2))
        
        if (distance > 4.5) {
            return 0.5
        }
    }

    return 1
}