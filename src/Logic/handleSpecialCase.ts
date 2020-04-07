import { Move, State, Piece, getNeighbours, Player, Color } from "@henrikthoroe/swc-client";
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";
import { filter } from "@henrikthoroe/swc-client/dist/utils";

export interface SpecialCaseResult {
    isSpecialCase: boolean
    success: boolean,
    selectedMove: Move | null
}

const Constants = {
    initialMoveCount: 440,
    maximumUndeployed: 11,
    guaranteedWin: 200
}

function handleInitialMove(state: State, moves: Move[], player: Player): Move {
    if (moves.length !== Constants.initialMoveCount) {
        throw new Error(`Invalid Input`)
    }

    const beetleMoves = moves.filter(m => (m.start as Piece).type === Type.BEETLE)
    let min = Infinity
    let selected: Move | null = null

    for (const move of beetleMoves) {
        const pos = Math.abs(move.end.x) + Math.abs(move.end.y) + Math.abs(move.end.z)
        const neighbourFields = getNeighbours(state.board, move.end)
        const count = filter(neighbourFields, neighbour => neighbour.pieces.length > 0 || neighbour.isObstructed).length
        const border = 6 - neighbourFields.length
        const filled = count + border
        
        if (pos < min && filled === 0) {
            min = pos
            selected = move
        }
    }

    if (selected) {
        return selected
    }

    return beetleMoves[Math.floor(Math.random() * beetleMoves.length)]
}

/**
 * This function checks a state for special cases like the first move or guaranteed wins.
 * @param state 
 * @param player 
 * @param moves 
 * @param undeployed 
 */
export default function handleSpecialCase(state: State, player: Player, moves: Move[], undeployed: Piece[]): SpecialCaseResult {
    const errorResult: SpecialCaseResult = {
        isSpecialCase: true,
        success: false,
        selectedMove: null
    }

    if (moves.length === Constants.initialMoveCount) {
        try {
            return {
                isSpecialCase: true,
                success: true,
                selectedMove: handleInitialMove(state, moves, player)
            }
        } catch (e) {
            return errorResult
        }
    }

    return {
        isSpecialCase: false,
        success: false,
        selectedMove: null
    }
}