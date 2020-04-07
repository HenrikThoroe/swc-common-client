import { fetchMoves, State, Move } from "@henrikthoroe/swc-client"
import createMoveTable from "../Cache/createMoveTable"
import sortMoves from "../Logic/sortMoves"

const moveTable = createMoveTable()

/**
 * A wrapper for `fetchMoves` from '@henrikthoroe/swc-client'. This is used to handle the cache.
 * @returns An array of moves which the current player can perform on the passed state.
 */
export default function generateMoves(state: State, sorted: boolean = false): Move[] {
    if (sorted) {
        return moveTable.get(state, () => sortMoves(state, fetchMoves(state), state.currentPlayer))
    } else {
        return moveTable.get(state, () => fetchMoves(state))
    }
}