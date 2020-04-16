import { State, Move, Position, Piece, Color } from "@henrikthoroe/swc-client";
import copy from "../utils/copy";
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";
import invertColor from "../utils/invertColor";
import isPosition from "../utils/isPosition";

/**
 * This function simulates the state which results from appling the passed move to the passed state. 
 * The resulting state is passed to the action. The result of the action will be returned as the functions return value.
 * @param state The original state
 * @param move The state passed to the action relies on this move. 
 *             If `null` is passed only the `currentUser` property of the state will be changed.
 * @param action An action to perform on the resulting state. 
 *               Before this action is performed the move will be applied to the original state. 
 *               After performing the action the move will be undone.
 */
export default function simulateMove<T>(state: State, move: Move | null, action: (arg0: State) => T): T {
    let res: T

    // console.log(move, state.undeployed.red.length, state.undeployed.blue.length)
    performMove(state, move || undefined)
    // console.log(move, state.undeployed.red.length, state.undeployed.blue.length)
    res = action(state) 
    undoMove(state, move || undefined)
    // console.log(move, state.undeployed.red.length, state.undeployed.blue.length)
    // throw new Error("")
    return res
}
function removeFromPieceStack(stack: Piece[], type: Type) {
    let removed = false

    stack = stack.filter(piece => {
        if (removed) {
            return true
        }

        const equal = piece.type === type 

        if (equal) {
            removed = true
            return false
        }

        return true
    })

    return stack
}

function undoMove(state: State, move?: Move) {
    const undeployed = state.currentPlayer === Color.Red ? state.undeployed.blue : state.undeployed.red

    if (move === undefined) {
        state.turn -= 1
    } else if (!isPosition(move.start)) {
        state.turn -= 1
        undeployed.push(move.piece)
        state.board.fields[move.end.x + 5][move.end.y + 5].pieces.pop()
    } else if (isPosition(move.start)) {
        state.turn -= 1
        // console.log(state.board.fields[move.start.x + 5][move.start.y + 5])
        // console.log(state.board.fields[move.end.x + 5][move.end.y + 5])
        state.board.fields[move.start.x + 5][move.start.y + 5].pieces.push(move.piece)
        state.board.fields[move.end.x + 5][move.end.y + 5].pieces.pop()
        // console.log(state.board.fields[move.start.x + 5][move.start.y + 5])
        // console.log(state.board.fields[move.end.x + 5][move.end.y + 5])
        // throw ""
    }

    state.currentPlayer = invertColor(state.currentPlayer)
} 

function performMove(state: State, move?: Move) {
    const undeployed = state.currentPlayer === Color.Red ? state.undeployed.red : state.undeployed.blue

    if (move === undefined) {
        state.turn += 1
    } else if (!isPosition(move.start)) {
        state.turn += 1
        
        if (state.currentPlayer === Color.Red) {
            state.undeployed.red = removeFromPieceStack(undeployed, move.piece.type)
        } else {
            state.undeployed.blue = removeFromPieceStack(undeployed, move.piece.type)
        }

        state.board.fields[move.end.x + 5][move.end.y + 5].pieces.push(move.start)
    } else if (isPosition(move.start)) {
        state.turn += 1
        // console.log(state.board.fields[move.start.x + 5][move.start.y + 5])
        // console.log(state.board.fields[move.end.x + 5][move.end.y + 5])
        state.board.fields[move.start.x + 5][move.start.y + 5].pieces.pop()
        state.board.fields[move.end.x + 5][move.end.y + 5].pieces.push(move.piece)
        // console.log(state.board.fields[move.start.x + 5][move.start.y + 5])
        // console.log(state.board.fields[move.end.x + 5][move.end.y + 5])
    }

    state.currentPlayer = invertColor(state.currentPlayer)
}

// function performMove(state: State, move?: Move, positive: boolean = true) {
//     const addPiece = (x: number, y: number, piece: Piece) => {
//         const ref = state.board.fields[x + 5][y + 5].pieces

//         if (ref !== undefined) {
//             ref.push(piece)
//         }
//     }

//     state.turn += positive ? 1 : -1
//     state.currentPlayer = state.currentPlayer === Color.Red ? Color.Blue : Color.Red

//     if (move && !isPosition(move.start) && positive) {
//         const undeployed = state.currentPlayer === Color.Red ? state.undeployed.blue : state.undeployed.red
//         const piece = move.start
//         let removed = false

//         addPiece(move.end.x, move.end.y, piece)
        
//         if (state.currentPlayer === Color.Red) {
//             state.undeployed.blue = undeployed.filter(p => {
//                 if (removed) {
//                     return true
//                 }

//                 const samePiece = p.owner === piece.owner && p.type === piece.type

//                 if (samePiece) {
//                     removed = true
//                     return false
//                 }
                
//                 return true 
//             })
//         } else {
//             state.undeployed.red = undeployed.filter(p => {
//                 if (removed) {
//                     return true
//                 }

//                 const samePiece = p.owner === piece.owner && p.type === piece.type

//                 if (samePiece) {
//                     removed = true
//                     return false
//                 }
                
//                 return true 
//             })
//         }
//     } else if (move && !isPosition(move.start) && !positive) {
//         const pieces = state.board.fields[move.end.x + 5][move.end.y + 5].pieces
//         const piece = pieces.pop()!

//         if (state.currentPlayer === Color.Blue) {
//             state.undeployed.blue.push(piece)
//         } else {
//             state.undeployed.red.push(piece)
//         }
//     } else if (move && positive) {
//         const start = move.start as Position
//         const pieces = state.board.fields[start.x + 5][start.y + 5].pieces
//         const piece = pieces.pop()!
        
//         addPiece(move.end.x, move.end.y, piece)
//     } else if (move && isPosition(move.start) && !positive) {
//         const start = move.end as Position
//         const pieces = state.board.fields[start.x + 5][start.y + 5].pieces
//         const piece = pieces.pop()!
        
//         addPiece(move.start.x, move.start.y, piece)
//     }
// }

// function undoMove(state: State, move?: Move) {
//     applyMove(state, move, false)
// }