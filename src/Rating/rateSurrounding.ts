import { State, Move, getNeighbours } from "@henrikthoroe/swc-client";
import { foreach, flat, filter } from "@henrikthoroe/swc-client/dist/utils";
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";

export default function rateSurrounding(state: State, moves: Move[]): number {
    const allFields = flat(state.board.fields)

    for (const field of allFields) {
        if (field.pieces.findIndex(piece => piece.owner !== state.currentPlayer && piece.type === Type.BEE) !== -1) {
            const neighbourFields = getNeighbours(state.board, field.position)
            const count = filter(neighbourFields, neigh => neigh.pieces.length > 0 || neigh.isObstructed).length
            const border = 6 - neighbourFields.length
            const filled = count + border

            if (filled >= 6) {
                return Infinity
            }

            return Math.pow(2, filled)
        }
    }

    return 0
}