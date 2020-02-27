import { State, Move, Position, Piece, Color } from "@henrikthoroe/swc-client";
import copy from "../utils/copy";
import Timer from "../utils/Timer";
import nextState from "./nextState";
import hash from 'object-hash'

export default function simulateMove<T>(state: State, move: Move | null, action: (arg0: State) => T): T {
    // const a = hash.MD5(state)
    // const a_t = state.turn
    // const a_p = state.currentPlayer === Color.Red ? Color.Red : Color.Blue
    // const c = copy(state)
    applyMove(state, move || undefined)
    const res = action(state) 
    undoMove(state, move || undefined)

    // console.log(a_t, state.turn)
    // console.log(a_p, state.currentPlayer)
    // console.log(a === hash.MD5(state), move ? isPosition(move.start) : "No Move", c.undeployed.red.length === state.undeployed.red.length, c.undeployed.blue.length === state.undeployed.blue.length)
    // console.log(c.undeployed.red.length, c.undeployed.blue.length, state.undeployed.red.length, state.undeployed.blue.length)

    return res
}

function isPosition(obj: any): obj is Position {
    return (obj as Position).x !== undefined && (obj as Position).y !== undefined && (obj as Position).z !== undefined
}

function applyMove(state: State, move?: Move, positive: boolean = true) {
    const addPiece = (x: number, y: number, piece: Piece) => {
        const ref = state.board.fields[x + 5][y + 5].pieces

        if (ref !== undefined) {
            ref.push(piece)
        }
    }

    state.turn += positive ? 1 : -1
    state.currentPlayer = state.currentPlayer === Color.Red ? Color.Blue : Color.Red

    if (move && !isPosition(move.start) && positive) {
        const undeployed = state.currentPlayer === Color.Red ? state.undeployed.blue : state.undeployed.red
        const piece = copy(move.start)
        let removed = false

        addPiece(move.end.x, move.end.y, piece)
        
        if (state.currentPlayer === Color.Red) {
            state.undeployed.blue = undeployed.filter(p => {
                if (removed) {
                    return true
                }

                const samePiece = p.owner === piece.owner && p.type === piece.type

                if (samePiece) {
                    removed = true
                    return false
                }
                
                return true 
            })
        } else {
            state.undeployed.red = undeployed.filter(p => {
                if (removed) {
                    return true
                }

                const samePiece = p.owner === piece.owner && p.type === piece.type

                if (samePiece) {
                    removed = true
                    return false
                }
                
                return true 
            })
        }
    } else if (move && !isPosition(move.start) && !positive) {
        const pieces = state.board.fields[move.end.x + 5][move.end.y + 5].pieces
        const piece = copy(pieces.pop())!

        if (state.currentPlayer === Color.Red) {
            state.undeployed.blue.push(piece)
        } else {
            state.undeployed.red.push(piece)
        }
    } else if (move && positive) {
        const start = move.start as Position
        const pieces = state.board.fields[start.x + 5][start.y + 5].pieces
        const piece = copy(pieces.pop())!
        
        addPiece(move.end.x, move.end.y, piece)
    } else if (move && isPosition(move.start) && !positive) {
        const start = move.end as Position
        const pieces = state.board.fields[start.x + 5][start.y + 5].pieces
        const piece = copy(pieces.pop())!
        
        addPiece(move.start.x, move.start.y, piece)
    }
}

function undoMove(state: State, move?: Move) {
    applyMove(state, move, false)
}