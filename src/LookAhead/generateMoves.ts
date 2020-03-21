import { fetchMoves, State, Move } from "@henrikthoroe/swc-client"
import LookupTable from "../Cache/LookupTable"
import hashState from "../utils/hashState"

const moveTable = new LookupTable<State, Move[]>(3000, hashState)

export default function generateMoves(state: State): Move[] {
    const cached = moveTable.read(state)

    if (cached) {
        return cached
    }

    const moves = fetchMoves(state)
    moveTable.push(state, moves)

    return moves
}