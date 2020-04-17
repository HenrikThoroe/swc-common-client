import { Color, State } from "@henrikthoroe/swc-client";
import Mobility, { PieceCollection, emptyPieceCollection, sumPieceCollection } from "../Mobility";
import enumerateBoard from "../../utils/enumerateBoard";
import Piece, { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";
import isDraggable from "../../LookAhead/isDraggable"

function scanUndeployed(pieces: Piece[]): PieceCollection {
    const collection = emptyPieceCollection()

    for (const piece of pieces) {
        switch (piece.type) {
            case Type.BEE:
                collection.bee += 1
                break
            case Type.BEETLE:
                collection.beetle += 1
                break
            case Type.ANT:
                collection.ant += 1
                break
            case Type.SPIDER:
                collection.spider += 1
                break
            case Type.GRASSHOPPER:
                collection.grasshopper += 1
                break
        }
    }

    return collection
}

function scanDeployed(state: State, color: Color): PieceCollection {
    const collection = emptyPieceCollection()

    enumerateBoard(state.board, field => {
        const pieces = field.pieces
        const topPiece = pieces[pieces.length - 1]

        if (topPiece !== undefined && topPiece.owner === color && isDraggable(state, field.position)) {
            switch (topPiece.type) {
                case Type.BEE:
                    collection.bee += 1
                    break
                case Type.BEETLE:
                    collection.beetle += 1
                    break
                case Type.ANT:
                    collection.ant += 1
                    break
                case Type.SPIDER:
                    collection.spider += 1
                    break
                case Type.GRASSHOPPER:
                    collection.grasshopper += 1
                    break
            }
        }
    })

    return collection
}

export default function scanMobility(state: State, color: Color): Mobility {
    const undeployedPieces = color === Color.Blue ? state.undeployed.blue : state.undeployed.red
    const undeployed = scanUndeployed(undeployedPieces)
    const draggable = undeployed.bee === 0 ? scanDeployed(state, color) : emptyPieceCollection()

    return {
        draggable: draggable,
        undeployed: undeployed
    }
}