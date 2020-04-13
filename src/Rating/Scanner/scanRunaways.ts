import { State, Position, Board, Color } from "@henrikthoroe/swc-client";
import Aspect from "../Aspect";
import enumerateBoard from "../../utils/enumerateBoard";
import LookupTable from "../../Cache/LookupTable";
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";
import distance from "../../utils/distance";

function beePositions(board: Board): Aspect<Position | undefined> {
    const res: Aspect<Position | undefined> = { red: undefined, blue: undefined }

    enumerateBoard(board, field => {
        const piece = field.pieces.find(p => p.type === Type.BEE)
        if (piece) {
            if (piece.owner === Color.Blue) {
                res.blue = field.position
            } else {
                res.red = field.position
            }
        }
    })

    return res
}

export default function scanRunaways(state: State): Aspect<number> {
    const res: Aspect<number> = { red: 0, blue: 0 }
    const bees = beePositions(state.board)
    const critical = 3

    enumerateBoard(state.board, field => {
        for (const piece of field.pieces) {
            if (piece.owner === Color.Red && bees.red) {
                const dist = distance(field.position, bees.red)

                if (dist >= critical) {
                    res.red += 1
                }
            } else if (piece.owner === Color.Blue && bees.blue) {
                const dist = distance(field.position, bees.blue)

                if (dist >= critical) {
                    res.blue += 1
                }
            }
        }
    }) 

    return res
}