import { chooseGamePhase } from "../Rating/GamePhase"
import { Color, Move, State } from "@henrikthoroe/swc-client"
import scanSurrounding from "../Rating/Scanner/scanSurrounding"
import scanMobility from "../Rating/Scanner/scanMobility"
import isPosition from "../utils/isPosition"
import simulateMove from "../LookAhead/simulateMove"
import evaluate from "../Rating/evaluate"
import { StateMemoryTable } from "../Cache/createStateMemoryTable"
import { ConcreteAspect, substantiateAspect } from "../Rating"
import evaluateSurrounding from "../Rating/evaluateSurrounding"
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece"

interface EvaluationMap {
    move: Move
    eval: number
    surrounding: number
}

function mapMoves(state: State, color: Color, moves: Move[]): EvaluationMap[] {
    return moves.map(move => 
        simulateMove(state, move, next => 
            ({
                move: move,
                eval: evaluate(next, color).value,
                surrounding: evaluateSurrounding(substantiateAspect(color, scanSurrounding(next)))
            })
        )
    )
}

function sortEarlyGame(map: EvaluationMap[]): Move[] {
    const applyFactor = (map: EvaluationMap) => isPosition(map.move.start) ? map.eval : map.eval + 8

    return map
        .sort((a, b) => applyFactor(b) - applyFactor(a))
        .map(map => map.move)
}

/**
 * Use this function to order moves which do not directly affect the surrounding of any queen. 
 * It assumes that deploying grasshoppers or beetles will provide the highest chance to surround the enemy queen with further moves.
 * @param mapArray 
 */
function applyHeuristics(mapArray: EvaluationMap[]): EvaluationMap[] {
    for (const map of mapArray) {
        if (!isPosition(map.move.start)) {
            switch (map.move.start.type) {
                case Type.GRASSHOPPER:
                    map.eval += 1
                    break
                case Type.BEETLE:
                    map.eval += 0.9
                    break
                case Type.ANT:
                    map.eval += 0.8
                    break
            }
        }
    }

    return mapArray.sort((a, b) => b.eval - a.eval)
}

function sortMidGame(currentSurrounding: number, map: EvaluationMap[]): Move[] {
    const sMap = map.sort((a, b) => b.surrounding - a.surrounding)
    const splitted = {
        better: sMap
            .filter(m => m.surrounding > currentSurrounding)
            .sort((a, b) => b.eval - a.eval),
        equal: sMap
            .filter(m => m.surrounding === currentSurrounding)
            .sort((a, b) => b.eval - a.eval),
        worse: sMap
            .filter(m => m.surrounding < currentSurrounding)
            .sort((a, b) => b.eval - a.eval)
    }

    return [...splitted.better, ...applyHeuristics(splitted.equal), ...splitted.worse].map(m => m.move)
}

/**
 * The function orders the passed moves based on the game's state. 
 * Using this method before passing the moves to the logic (PVS, AlphaBeta, ...) speeds up the execution dramatically and leads most of the time to better results.
 * 
 * @param state 
 * @param moves 
 * @param player 
 * @todo Simplify and document the code. Improve heuristics to take the piece's type into account. Improve performance
 */
export default function sortMoves(state: State, moves: Move[], player: Color, memory: StateMemoryTable): Move[] {
    const start = process.hrtime()[1]
    const log = (res: Move[]) => {
        console.log(`Sorting took ${((process.hrtime()[1] - start) / 1000000).toFixed(3)} ms`)
        return res
    }
    const map = mapMoves(state, player, moves)
    const mobility = { red: scanMobility(state, Color.Red), blue: scanMobility(state, Color.Blue) }
    const surrounding = scanSurrounding(state)
    const phase = chooseGamePhase(player, surrounding, mobility)

    switch (phase) {
        case "early":
            return log(sortEarlyGame(map))
        default: 
            return log(sortMidGame(evaluateSurrounding(substantiateAspect(player, surrounding)), map))
    }
}