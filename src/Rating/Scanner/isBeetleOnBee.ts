import { State, Color } from "@henrikthoroe/swc-client";
import enumerateBoard from "../../utils/enumerateBoard";
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";
import invertColor from "../../utils/invertColor";

export default function isBeetleOnBee(state: State, color: Color, log: boolean = false): boolean {
    let res = false

    enumerateBoard(state.board, field => {
        if (field.pieces.length === 2) {
            const down = field.pieces[0]
            const up = field.pieces[1]
            if (down.type === Type.BEE && down.owner === invertColor(color) && up.type === Type.BEETLE && up.owner === color) {
                res = true
            }
        }
    })

    return res
}