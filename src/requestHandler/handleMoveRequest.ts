import { State, Piece, Player } from "@henrikthoroe/swc-client"
import Timer from "../utils/Timer"
import generateMoves from "../LookAhead/generateMoves"
import Environment from "../utils/Environment"
import handleSpecialCase from "../Logic/handleSpecialCase"
import NegaScout from "../Logic/NegaScout"
import globalState from "../globalState"
import isPosition from "../utils/isPosition"
import { comparePositions } from "@henrikthoroe/swc-client/dist/client/Model/Position"
import MTDf from "../Logic/MTDf"
import simulateMove from "../LookAhead/simulateMove"
import evaluate from "../Rating/evaluate"
import scanSurrounding from "../Rating/Scanner/scanSurrounding"

let initiated = false

export default function handleMoveRequest(state: State, undeployed: Piece[], player: Player, elapsedTime: number) {
    try {
        if (!initiated) {
            globalState.color = player.color
            initiated = true
        }
    
        const timer = new Timer(elapsedTime)
        const available = generateMoves(state, true)
    
        Environment.debugPrint(`Already elpased time: ${elapsedTime}`)
    
        if (available.length === 0) {
            throw new Error(`No Moves Available`)
        }
    
        if (globalState.simpleClient) {
            return available[Math.floor(Math.random() * available.length)]
        }
    
        const fallback = available[0]
        const preRating = handleSpecialCase(state, player, available, undeployed, 1890 - timer.read())
        const logic = new NegaScout(state, available, player, 3, 1850 - timer.read())
    
        if (preRating.isSpecialCase && preRating.success) {
            return preRating.selectedMove!
        } else if (preRating.isSpecialCase) {
            throw new Error(`Failed to Generate Move`)
        }
    
        const result = logic.find()
    
        Environment.print(`Finished search after ${timer.read()}ms`)
        Environment.debugPrint(`Rating: ${result.rating}`)
        Environment.debugPrint(`Selected move:`, result.value)
    
        if (result.success) {
            const valid = available.some(move => {
                if (isPosition(move.start) && isPosition(result.value!.start)) {
                    return comparePositions(move.end, result.value!.end) && comparePositions(move.start, result.value!.start)
                } else if (!isPosition(move.start) && !isPosition(result.value!.start)) {
                    return comparePositions(move.end, result.value!.end) && move.start.type === result.value!.start.type
                } else {
                    return false
                }
            })
    
            if (!valid) {
                Environment.print("Invalid Move", result.value, available)
                return fallback
            }

            setTimeout(() => {
                for (const move of available) {
                    simulateMove(state, move, next => {
                        console.log(move.end)
                        console.log(evaluate(next, player.color))
                        console.log(scanSurrounding(next))
                        console.log()
                        console.log()
                        console.log()
                    })
                }
            }, 1000)
    
            return result.value!
        } else {
            return fallback
        } 
    } catch (e) {
        console.error(e)
        throw e
    }
}