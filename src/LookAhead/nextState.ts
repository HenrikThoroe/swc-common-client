import { State, Move, Piece, Position } from "@henrikthoroe/swc-client";
import Color from "@henrikthoroe/swc-client/dist/client/Model/Color";
import copy from '../utils/copy'

export default function nextState(currentState: State, move: Move): State {
    const state: State = copy(currentState)
    // const udpRed = copy(state.undeployed.red)
    // const udpBlue = copy(state.undeployed.blue)

    const addPiece = (x: number, y: number, piece: Piece) => {
        const ref = state.board.fields[x + 5][y + 5].pieces

        if (ref !== undefined) {
            ref.push(piece)
        }
    }

    // state.undeployed.blue = udpBlue
    // state.undeployed.red = udpRed
    state.turn += 1
    state.currentPlayer = state.currentPlayer === Color.Red ? Color.Blue : Color.Red

    if ((move.start as any).owner !== undefined) {
        const undeployed = state.currentPlayer === Color.Red ? state.undeployed.blue : state.undeployed.red
        const piece = copy(move.start as Piece)

        addPiece(move.end.x, move.end.y, piece)
        
        if (state.currentPlayer === Color.Red) {
            state.undeployed.blue = undeployed.filter(p => p.owner !== piece.owner && p.type !== piece.type)
        } else {
            state.undeployed.red = undeployed.filter(p => p.owner !== piece.owner && p.type !== piece.type)
        }
    } else {
        const start = move.start as Position
        const pieces = state.board.fields[start.x + 5][start.y + 5].pieces
        const piece = copy(pieces.pop())!
        
        addPiece(move.end.x, move.end.y, piece)
    }

    return state
}