import { fetchMoves, State, Move } from "@henrikthoroe/swc-client"
import LookupTable from "../Cache/LookupTable"
import hashState from "../utils/hashState"
import createMoveTable from "../Cache/createMoveTable"

const moveTable = createMoveTable()

/**
 * A wrapper for `fetchMoves` from '@henrikthoroe/swc-client'. This is used to handle the cache.
 * @returns An array of moves which the current player can perform on the passed state.
 */
export default function generateMoves(state: State): Move[] {
    const cached = moveTable.read(state)

    if (cached) {
        return cached
    }

    const moves = fetchMoves(state)
    moveTable.push(state, moves)

    return moves
}