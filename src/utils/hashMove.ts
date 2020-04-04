import { Move, Position, Piece } from "@henrikthoroe/swc-client";
import encodeBase64 from "./encodeBase64";
import isPosition from "./isPosition";

export default function hashMove(move: Move) {
    const positionBitmap = (pos: Position) => {
        const x = pos.x + 5
        const y = pos.y + 5
        const z = pos.z + 5

        return (x << 8) ^ (y << 4) ^ z
    }

    const pieceBitmap = (piece: Piece) => {
        const t = piece.type
        const o = piece.owner

        return (t << 1) ^ o
    }

    if (isPosition(move.start)) {
        return encodeBase64((positionBitmap(move.start) << 12) ^ positionBitmap(move.end))
    } else {
        return encodeBase64((positionBitmap(move.end) << 4) ^ pieceBitmap(move.start))
    }
}