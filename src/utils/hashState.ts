import { State } from "@henrikthoroe/swc-client";
import enumerateBoard from "./enumerateBoard";
import encodeBase64 from "./encodeBase64";

/**
 * This function creates an unique hash value for a state. 
 * It calculates it's value from the current player and all deployed pieces.
 * Each piece is converted into a bitmask containing information about the position, type and owner of the pice.
 * @param state The state to hash
 * @returns A base64 encoded string containing information about the state's board's pieces and the current player.
 */
export default function hashState(state: State): string {
    let key = encodeBase64(state.currentPlayer)

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