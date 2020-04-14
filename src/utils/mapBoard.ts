import { Board, Field } from "@henrikthoroe/swc-client";
import enumerateBoard from "./enumerateBoard";

export default function mapBoard<T>(board: Board, transform: (arg0: Field) => T): T[] {
    const res: T[] = []
    enumerateBoard(board, field => res.push(transform(field)))
    return res
}