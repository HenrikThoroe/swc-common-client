import { Move, Position, Piece } from "@henrikthoroe/swc-client";
import encodeBase64 from "./encodeBase64";
import isPosition from "./isPosition";
import indexPosition from "./indexPosition";

export default function hashMove(move: Move) {
    const pieceBitmap = (piece: Piece) => {
        const t = piece.type
        const o = piece.owner

        return (t << 1) ^ o
    }

    if (isPosition(move.start)) {
        return encodeBase64((indexPosition(move.start.x, move.start.z) << 7) ^ indexPosition(move.end.x, move.end.z))
    } else {
        return encodeBase64((indexPosition(move.end.x, move.end.z) << 4) ^ pieceBitmap(move.start))
    }
}