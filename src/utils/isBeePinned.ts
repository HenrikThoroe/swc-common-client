import { Aspect } from "../Rating";
import enumerateBoard from "./enumerateBoard";
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";
import isDraggable from "@henrikthoroe/swc-client/dist/client/Worker/Moves/isDraggable";
import { State, Color } from "@henrikthoroe/swc-client";

/**
 * Returns an aspect which contains whether the bees are pinned or not.
 * @param state 
 */
export default function isBeePinned(state: State): Aspect<boolean> {
    const result: Aspect<boolean> = { red: false, blue: false }

    enumerateBoard(state.board, field => {
        if (field.pieces.length > 0) {
            const index = field.pieces.findIndex(piece => piece.type === Type.BEE)

            if (index > -1) {
                let pinned = true

                if (index === field.pieces.length - 1) {
                    pinned = !isDraggable(state, field.position)
                }
                
                if (field.pieces[index].owner === Color.Blue) {
                    result.blue = pinned
                } else if (field.pieces[index].owner === Color.Red) {
                    result.red = pinned
                }
            }
        }
    })

    return result
}