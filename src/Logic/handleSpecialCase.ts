import { Move, State, Piece, getNeighbours, Player, Color } from "@henrikthoroe/swc-client";
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";
import { filter } from "@henrikthoroe/swc-client/dist/utils";

export interface SpecialCaseResult {
    isSpecialCase: boolean
    success: boolean,
    selectedMove: Move | null
}

const Constants = {
    initialMoveCount: 968,
    maximumUndeployed: 11
}

function hasPiece(type: Type, collection: Piece[]): boolean {
    for (const piece of collection) {
        if (piece.type === type) {
            return true
        }
    }

    return false
}

function handleInitialMove(state: State, moves: Move[]): Move {
    if (moves.length !== Constants.initialMoveCount) {
        throw new Error(`Invalid Input`)
    }

    const beeMoves = moves.filter(m => (m.start as Piece).type === Type.BEE)
    let min = Infinity
    let selected: Move | null = null

    for (const move of beeMoves) {
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

    return beeMoves[Math.floor(Math.random() * beeMoves.length)]
}

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
                selectedMove: handleInitialMove(state, moves)
            }
        } catch (e) {
            return errorResult
        }
    }

    if (undeployed.length === Constants.maximumUndeployed && moves.length > 0) {
        if ((player.color === Color.Red && !hasPiece(Type.BEE, state.undeployed.blue)) || (player.color === Color.Blue && !hasPiece(Type.BEE, state.undeployed.red))) {
            const beeMoves = moves.filter(m => (m.start as Piece).type === Type.BEE)
            return {
                isSpecialCase: true,
                success: true,
                selectedMove: beeMoves[0]
            }
        }
    }

    return {
        isSpecialCase: false,
        success: false,
        selectedMove: null
    }
}