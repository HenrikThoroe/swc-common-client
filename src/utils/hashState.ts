import { State } from "@henrikthoroe/swc-client";
import enumerateBoard from "./enumerateBoard";
import encodeBase64 from "./encodeBase64";

export default function hashState(state: State): string {
    let key = `p:${state.currentPlayer}`

    enumerateBoard(state.board, field => {
        for (let i = 0; i < field.pieces.length; ++i) {
            const x = field.position.x + 5
            const y = field.position.y + 5
            const z = field.position.z + 5
            const id = (x << 12) ^ (y << 8) ^ (z << 4) ^ (field.pieces[i].type << 1) ^ field.pieces[i].owner
            key += encodeBase64(id)
        }
    })

    return key
}