import { State, Move, getNeighbours } from "@henrikthoroe/swc-client";
import { foreach, flat, filter, map } from "@henrikthoroe/swc-client/dist/utils";
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";

export default function rateSurrounding(state: State, moves: Move[]): number {
    const allFields = flat(map(state.board.fields, group => filter(group, field => field !== null)))

    for (let i = 0; i < allFields.length; ++i) {
        const field = allFields[i]
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