import { State, Move, Piece, Position } from "@henrikthoroe/swc-client";
import Color from "@henrikthoroe/swc-client/dist/client/Model/Color";
import copy from '../utils/copy'

export default function nextState(currentState: State, move?: Move): State {
    const state: State = copy(currentState)
    const addPiece = (x: number, y: number, piece: Piece) => {
        const ref = state.board.fields[x + 5][y + 5].pieces

        if (ref !== undefined) {
            ref.push(piece)
        }
    }

    state.turn += 1
    state.currentPlayer = state.currentPlayer === Color.Red ? Color.Blue : Color.Red

    if (move && (move.start as any).owner !== undefined) {
        const undeployed = state.currentPlayer === Color.Red ? state.undeployed.blue : state.undeployed.red
        const piece = copy(move.start as Piece)
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
    } else if (move) {
        const start = move.start as Position
        const pieces = state.board.fields[start.x + 5][start.y + 5].pieces
        const piece = copy(pieces.pop())!
        
        addPiece(move.end.x, move.end.y, piece)
    }

    return state
}