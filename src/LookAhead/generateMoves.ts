import { fetchMoves, State, Move } from "@henrikthoroe/swc-client"

export default function generateMoves(state: State): Move[] {
    return fetchMoves(state, false)
}