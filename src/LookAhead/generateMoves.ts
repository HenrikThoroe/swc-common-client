import { fetchMoves, State, Move, Color } from "@henrikthoroe/swc-client"
import createMoveTable from "../Cache/createMoveTable"
import sortMoves from "../Logic/sortMoves"
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece"
import isPosition from "../utils/isPosition"

const moveTable = createMoveTable()

/**
 * A wrapper for `fetchMoves` from '@henrikthoroe/swc-client'. This is used to handle the cache.
 * @returns An array of moves which the current player can perform on the passed state.
 */
export default function generateMoves(state: State, sorted: boolean = true): Move[] {
    const undeployed = () => {
        if (state.currentPlayer === Color.Red) {
            return state.undeployed.red
        } else {
            return state.undeployed.blue
        }
    } 

    const filteredMoves = () => {
        const moves = fetchMoves(state)
        const canDeployAnt = undeployed().some(piece => piece.type === Type.ANT)

        if (canDeployAnt) {
            return moves.filter(move => isPosition(move.start) ? true : move.start.type !== Type.SPIDER)
        } else {
            return moves
        }
    }

    if (sorted) {
        return moveTable.get(state, () => sortMoves(state, filteredMoves(), state.currentPlayer))
    } else {
        return moveTable.get(state, () => filteredMoves())
    }
}