import { State, Position } from "@henrikthoroe/swc-client";
import generateMoves from "./generateMoves";
import { comparePositions } from "@henrikthoroe/swc-client/dist/client/Model/Position";
import isPosition from "../utils/isPosition";

/**
 * Checks whether the topmost piece at the passed position is draggable.
 * Note: Prefer this method over the method provided by the game API. This one supports the internal caching methods which is why it is expected to be much faster. 
 */
export default function isDraggable(state: State, position: Position) {
    const moves = generateMoves(state, false)
    return moves.some(move => isPosition(move.start) ? comparePositions(move.start, position) : false) 
}