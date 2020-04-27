import { fetchMoves, State, Move } from "@henrikthoroe/swc-client"
import createMoveTable from "../Cache/createMoveTable"
import sortMoves from "../Logic/sortMoves"
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece"

const moveTable = createMoveTable()

/**
 * A wrapper for `fetchMoves` from '@henrikthoroe/swc-client'. This is used to handle the cache.
 * @returns An array of moves which the current player can perform on the passed state.
 */
export default function generateMoves(state: State, sorted: boolean = true): Move[] {
    const getMoves = (s: State) => {
        return fetchMoves(s).filter(move => move.piece.type === Type.BEE)
    }

    if (sorted) {
        return moveTable.get(state, () => sortMoves(state, getMoves(state), state.currentPlayer))
    } else {
        return moveTable.get(state, () => getMoves(state))
    }
}