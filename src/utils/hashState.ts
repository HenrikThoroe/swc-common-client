import { State } from "@henrikthoroe/swc-client";
import enumerateBoard from "./enumerateBoard";
import encodeBase64 from "./encodeBase64";
import HashKey from "./HashKey";
import indexPosition from "./indexPosition";

type Storage = [[number[], number[]], [number[], number[]], [number[], number[]], [number[], number[]], [number[], number[]]]

/**
 * This function creates an unique hash value for a state. 
 * It calculates it's value from the current player and all deployed pieces.
 * Each piece is converted into a bitmask containing information about the position, type and owner of the pice.
 * @param state The state to hash
 * @returns A base64 encoded string containing information about the state's board's pieces and the current player.
 */
export function hashStateLegacy(state: State): string {
    let key = encodeBase64(state.currentPlayer)

    enumerateBoard(state.board, field => {
        const x = field.position.x + 5
        const y = field.position.y + 5
        const z = field.position.z + 5

        for (let i = 0; i < field.pieces.length; ++i) {
            // x (4 bit) - y (4 bit) - z (4 bit) - piece (3 bit) - owner (1 bit) => 16 bit
            const id = (x << 12) ^ (y << 8) ^ (z << 4) ^ (field.pieces[i].type << 1) ^ field.pieces[i].owner
            key += encodeBase64(id)
        }
    })

    return key
}

/**
 * This function creates an unique hash value for a state. 
 * It calculates it's value from the current player and all deployed pieces.
 * @param state 
 */
export default function hashState(state: State): string {
    const undeployedFlag = 0b1111111
    const key = new HashKey(5)
    const storage: Storage = [[[], []], [[], []], [[], []], [[], []], [[], []]]

    for (const piece of state.undeployed.red) {
        storage[piece.type][piece.owner].push(undeployedFlag)
    }

    for (const piece of state.undeployed.blue) {
        storage[piece.type][piece.owner].push(undeployedFlag)
    }

    enumerateBoard(state.board, field => {
        if (field.pieces.length === 0) {
            return
        } 

        const index = indexPosition(field.position.x, field.position.z)

        for (let i = 0; i < field.pieces.length; ++i) {
            storage[field.pieces[i].type][field.pieces[i].owner].push(index)
        }
    })


    for (const type of storage) {
        for (const owner of type) {
            for (const piece of owner) {
                key.push(piece, 7)
            }
        }
    }

    return key.encode()
}