import { Piece, Position } from "@henrikthoroe/swc-client";

export default function isPosition(obj: Piece | Position): obj is Position {
    return (obj as Position).x !== undefined
}