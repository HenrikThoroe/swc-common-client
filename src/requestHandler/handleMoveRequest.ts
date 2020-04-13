import { State, Piece, Player } from "@henrikthoroe/swc-client"
import Timer from "../utils/Timer"
import generateMoves from "../LookAhead/generateMoves"
import Environment from "../utils/Environment"
import handleSpecialCase from "../Logic/handleSpecialCase"
import NegaScout from "../Logic/NegaScout"
import globalState from "../globalState"
import scanRunaways from "../Rating/Scanner/scanRunaways"

let initiated = false

export default function handleMoveRequest(state: State, undeployed: Piece[], player: Player, elapsedTime: number) {
    if (!initiated) {
        globalState.color = player.color
        initiated = true
    }

    const timer = new Timer(elapsedTime)
    const available = generateMoves(state, true)

    Environment.debugPrint(`Already elpased time: ${elapsedTime}`)

    Environment.debugPrint(scanRunaways(state))

    if (available.length === 0) {
        throw new Error(`No Moves Available`)
    }

    if (globalState.simpleClient) {
        return available[Math.floor(Math.random() * available.length)]
    }

    const fallback = available[0]
    const preRating = handleSpecialCase(state, player, available, undeployed, 1890 - timer.read())
    const logic = new NegaScout(state, available, player, 3, 1890 - timer.read())

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
        return result.value!
    } else {
        return fallback
    } 
}