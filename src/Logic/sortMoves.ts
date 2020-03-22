import { chooseGamePhase } from "../Rating/GamePhase"
import { Color, Move, State } from "@henrikthoroe/swc-client"
import scanSurrounding from "../Rating/Scanner/scanSurrounding"
import scanMobility from "../Rating/Scanner/scanMobility"
import isPosition from "../utils/isPosition"
import simulateMove from "../LookAhead/simulateMove"
import rate from "../Rating/rate"

interface EvaluationMap {
    move: Move
    rating: number
}

/**
 * The function orders the passed moves based on the game's state. 
 * Using this method before passing the moves to the logic (PVS, AlphaBeta, ...) speeds up the execution dramatically and leads most of the time to better results.
 * 
 * ---
 * **Note: The performance of the function is quite bad (~40ms). Use it only once for the initial moves.**
 * @param state 
 * @param moves 
 * @param player 
 * @todo Simplify and document the code. Improve heuristics to take the piece's type into account. Improve performance
 */
export default function sortMoves(state: State, moves: Move[], player: Color): Move[] {
    const start = process.hrtime()[1]
    const surrounding = scanSurrounding(state)
    const mobility = { red: scanMobility(state, Color.Red), blue: scanMobility(state, Color.Blue) }
    const phase = chooseGamePhase(player, surrounding, mobility)

    const moveMap: EvaluationMap[] = moves.map(move => simulateMove(state, move, next => ({ move: move, rating: rate(next, player).value })))
    const deployMap: EvaluationMap[] = []
    const dragMap: EvaluationMap[] = []

    for (const map of moveMap) {
        if (isPosition(map.move.start)) {
            dragMap.push(map)
        } else {
            deployMap.push(map)
        }
    }

    const deployMoves = deployMap.sort((a, b) => b.rating - a.rating).map(map => map.move)
    const dragMoves = dragMap.sort((a, b) => b.rating - a.rating).map(map => map.move)

    console.log(phase, deployMoves.length > 0 ? deployMoves[0].start : "no deploy move", dragMoves.length > 0 ? dragMoves[0].start : "no drag move")
    console.log("Sorting: ", (process.hrtime()[1] - start) / 1000000)
    if (phase === "early") {
        return [...deployMoves, ...dragMoves]
    }

    return [...deployMap.map(a => ({ move: a.move, rating: a.rating })), ...dragMap.map(a => ({ move: a.move, rating: a.rating + 10 }))].sort((a, b) => b.rating - a.rating).map(map => map.move)
}