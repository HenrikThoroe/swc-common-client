import { Move, State, Piece, getNeighbours, Player, Color } from "@henrikthoroe/swc-client";
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";
import { filter } from "@henrikthoroe/swc-client/dist/utils";
import mapBoard from "../utils/mapBoard";
import NegaScout from "./NegaScout";

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

function handleInitialMove(state: State, moves: Move[], player: Player, timeout: number): Move {
    if (moves.length !== Constants.initialMoveCount) {
        throw new Error(`Invalid Input`)
    }

    const start = Date.now()
    const beeMoves = moves.filter(m => (m.start as Piece).type === Type.BEE)
    const filteredMoves: Move[] = []

    for (const move of beeMoves) {
        const neighbourFields = getNeighbours(state.board, move.end)
        const count = filter(neighbourFields, neighbour => neighbour.pieces.length > 0 || neighbour.isObstructed).length
        const border = 6 - neighbourFields.length
        const filled = count + border
        
        if (filled === 0) {
            filteredMoves.push(move)
        }
    }

    const e = Date.now() - start
    const move = new NegaScout(state, filteredMoves, player, 3, timeout - e).find()

    if (move.success) {
        return move.value!
    }

    return filteredMoves[Math.floor(Math.random() * filteredMoves.length)]
}

/**
 * This function checks a state for special cases like the first move or guaranteed wins.
 * @param state 
 * @param player 
 * @param moves 
 * @param undeployed 
 */
export default function handleSpecialCase(state: State, player: Player, moves: Move[], undeployed: Piece[], timeout: number): SpecialCaseResult {
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
                selectedMove: handleInitialMove(state, moves, player, timeout)
            }
        } catch (e) {
            return errorResult
        }
    }

    // Oppoent deployed his bee => deploy own bee
    if (undeployed.some(piece => piece.type === Type.BEE) && mapBoard(state.board, field => field.pieces.some(p => p.type === Type.BEE)).some(bee => bee)) {
        const search = new NegaScout(state, moves.filter(m => m.piece.type === Type.BEE), player, 3, timeout).find()
        return {
            isSpecialCase: true,
            success: search.success,
            selectedMove: search.value
        }
    }

    return {
        isSpecialCase: false,
        success: false,
        selectedMove: null
    }
}