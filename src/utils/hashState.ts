import { State } from "@henrikthoroe/swc-client";
import enumerateBoard from "./enumerateBoard";
import encodeBase64 from "./encodeBase64";

export default function hashState(state: State): string {
    let key = ""

    enumerateBoard(state.board, field => {
        for (let i = 0; i < field.pieces.length; ++i) {
            const id = (field.position.x << 12) ^ (field.position.y << 8) ^ (field.position.z << 4) ^ (field.pieces[i].type << 3) ^ field.pieces[i].owner
            key += encodeBase64(id)
        }
    })

    return key
}