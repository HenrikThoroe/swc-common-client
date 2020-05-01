import { Move, State, Piece, getNeighbours, Player, Color, Board, Position } from "@henrikthoroe/swc-client";
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";
import { filter } from "@henrikthoroe/swc-client/dist/utils";
import mapBoard from "../utils/mapBoard";
import NegaScout from "./NegaScout";
import isPosition from "../utils/isPosition";
import globalState from "../globalState";

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

function beeSurrounding(board: Board, position: Position) {
    const neighbourFields = getNeighbours(board, position)
    const count = filter(neighbourFields, neighbour => neighbour.pieces.length > 0 || neighbour.isObstructed).length
    const border = 6 - neighbourFields.length
    return count + border
}

function handleInitialMove(state: State, moves: Move[], player: Player, timeout: number): Move {
    if (moves.length !== Constants.initialMoveCount) {
        throw new Error(`Invalid Input`)
    }

    const start = Date.now()
    const beeMoves = moves.filter(m => (m.start as Piece).type !== Type.BEE)
    const filteredMoves: Move[] = []

    for (const move of beeMoves) {
        if (beeSurrounding(state.board, move.end) === 0 && (Math.abs(move.end.x) + Math.abs(move.end.y) + Math.abs(move.end.z) < 8)) {
            filteredMoves.push(move)
        }
    }

    const e = Date.now() - start
    const move = new NegaScout(state, filteredMoves, player, globalState.depth, timeout - e).find()

    if (move.success) {
        return move.value!
    }

    return filteredMoves[Math.floor(Math.random() * filteredMoves.length)]
}

function handlePossibleBeeDeployment(state: State, moves: Move[], player: Player, timeout: number) {
    const start = Date.now()
    let exhaustive = true
    const filtered = moves.filter(move => {
        if (!isPosition(move.start) && move.start.type === Type.BEE) {
            if (beeSurrounding(state.board, move.end) < 3) {
                return true
            } else {
                exhaustive = false
                return false
            }
        } else {
            return true
        }
    })

    const e = Date.now() - start 
    const move = new NegaScout(state, !exhaustive ? moves : filtered, player, globalState.depth, timeout - e).find()

    if (move.success) {
        return move.value!
    }

    return null
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
        const search = handlePossibleBeeDeployment(state, moves.filter(m => m.piece.type === Type.BEE), player, timeout)//new NegaScout(state, moves.filter(m => m.piece.type === Type.BEE), player, 3, timeout).find()
        return {
            isSpecialCase: true,
            success: search !== null,
            selectedMove: search
        }
    }

    if (undeployed.some(piece => piece.type === Type.BEE)) {
        const move = handlePossibleBeeDeployment(state, moves, player, timeout)
        return {
            isSpecialCase: true,
            success: move !== null,
            selectedMove: move
        }
    }

    return {
        isSpecialCase: false,
        success: false,
        selectedMove: null
    }
}