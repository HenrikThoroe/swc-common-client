import { State, Move, getNeighbours, Color } from "@henrikthoroe/swc-client";
import { foreach, flat, filter, map } from "@henrikthoroe/swc-client/dist/utils";
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";
import { Aspect } from "."

export default function rateSurrounding(state: State): Aspect {
    const allFields = state.board.fields.flatMap(a => Object.values(a).filter(b => b !== null))
    let red: number | null = null
    let blue: number | null = null

    for (let i = 0; i < allFields.length; ++i) {
        const field = allFields[i]

        if (field.pieces.findIndex(piece => piece.type === Type.BEE) !== -1) {
            const owner = field.pieces.find(piece => piece.type === Type.BEE)!.owner
            const neighbourFields = getNeighbours(state.board, field.position)
            const count = filter(neighbourFields, neigh => neigh.pieces.length > 0 || neigh.isObstructed).length
            const border = 6 - neighbourFields.length
            const filled = count + border

            if (owner === Color.Blue) {
                blue = filled
            } else {
                red = filled
            }

            if (red !== null && blue !== null) {
                break
            }
        }
    }

    return { red: red || 0, blue: blue || 0 }
}