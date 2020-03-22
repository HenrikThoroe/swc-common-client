import { Color, State } from "@henrikthoroe/swc-client";
import Mobility, { PieceCollection, emptyPieceCollection } from "../Mobility";
import enumerateBoard from "../../utils/enumerateBoard";
import Piece, { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";
import isDraggable from "@henrikthoroe/swc-client/dist/client/Worker/Moves/isDraggable";

export default function scanMobility(state: State, color: Color): Mobility {
    const draggable = emptyPieceCollection()
    const undeployed = emptyPieceCollection()

    enumerateBoard(state.board, field => {
        const pieces = field.pieces
        const topPiece = pieces[pieces.length - 1]

        if (topPiece !== undefined && topPiece.owner === color && isDraggable(state, field.position)) {
            switch (topPiece.type) {
                case Type.BEE:
                    draggable.bee += 1
                    break
                case Type.BEETLE:
                    draggable.beetle += 1
                    break
                case Type.ANT:
                    draggable.ant += 1
                    break
                case Type.SPIDER:
                    draggable.spider += 1
                    break
                case Type.GRASSHOPPER:
                    draggable.grasshopper += 1
                    break
            }
        }
    })

    const _ = ((pieces: Piece[]) => {
        for (const piece of pieces) {
            switch (piece.type) {
                case Type.BEE:
                    undeployed.bee += 1
                    break
                case Type.BEETLE:
                    undeployed.beetle += 1
                    break
                case Type.ANT:
                    undeployed.ant += 1
                    break
                case Type.SPIDER:
                    undeployed.spider += 1
                    break
                case Type.GRASSHOPPER:
                    undeployed.grasshopper += 1
                    break
            }
        }
    })(color === Color.Blue ? state.undeployed.blue : state.undeployed.red)

    return {
        draggable: draggable,
        undeployed: undeployed
    }
}