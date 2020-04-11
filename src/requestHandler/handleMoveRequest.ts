import { State, Piece, Player } from "@henrikthoroe/swc-client"
import Timer from "../utils/Timer"
import generateMoves from "../LookAhead/generateMoves"
import Environment from "../utils/Environment"
import handleSpecialCase from "../Logic/handleSpecialCase"
import NegaScout from "../Logic/NegaScout"
import globalState from "../globalState"
import MTDf from "../Logic/MTDf"
import evaluate from "../Rating/evaluate"
import isBeetleOnBee from "../Rating/Scanner/isBeetleOnBee"
import invertColor from "../utils/invertColor"
import { comparePositions } from "@henrikthoroe/swc-client/dist/client/Model/Position"
import simulateMove from "../LookAhead/simulateMove"

let initiated = false

export default function handleMoveRequest(state: State, undeployed: Piece[], player: Player, elapsedTime: number) {
    if (!initiated) {
        globalState.color = player.color
        initiated = true
    }

    const timer = new Timer(elapsedTime)
    const available = generateMoves(state, true)

    // console.log(evaluate(state, player.color))

    // if (available.length < 400) {
    //     console.log(available.filter(function(item, pos) {
    //         return available.findIndex(m => comparePositions(m.end, item.end)) == pos;
    //     }))
    // }

    Environment.debugPrint(`Already elpased time: ${elapsedTime}`)

    if (available.length === 0) {
        throw new Error(`No Moves Available`)
    }

    if (globalState.simpleClient) {
        return available[Math.floor(Math.random() * available.length)]
    }

    const fallback = available[0]
    const preRating = handleSpecialCase(state, player, available, undeployed)
    const logic = new NegaScout(state, available, player, 3, 1890 - timer.read())

    if (preRating.isSpecialCase && preRating.success) {
        return preRating.selectedMove!
    } else if (preRating.isSpecialCase) {
        throw new Error(`Failed to Generate Move`)
    }

    const result = logic.find()

    Environment.print(`Finished search after ${timer.read()}ms`)
    Environment.debugPrint(`Result: `, result)
    Environment.debugPrint(`Selected move:`, result.value)

    if (result.success) {
        // simulateMove(state, result.value!, next => {
        //     console.log(evaluate(next, player.color))
        // })

        return result.value!
    } else {
        return fallback
    } 
}