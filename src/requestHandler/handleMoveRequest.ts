import { State, Piece, Player } from "@henrikthoroe/swc-client"
import Timer from "../utils/Timer"
import generateMoves from "../LookAhead/generateMoves"
import Environment from "../utils/Environment"
import sortMoves from "../Logic/sortMoves"
import handleSpecialCase from "../Logic/handleSpecialCase"
import NegaScout from "../Logic/NegaScout"
import globalState from "../globalState"

export default function handleMoveRequest(state: State, undeployed: Piece[], player: Player, elapsedTime: number) {
    const timer = new Timer(elapsedTime)
    let available = generateMoves(state)

    Environment.debugPrint(`Already elpased time: ${elapsedTime}`)

    if (available.length === 0) {
        throw new Error(`No Moves Available`)
    }

    if (globalState.simpleClient) {
        return available[Math.floor(Math.random() * available.length)]
    }

    if (available.length < 900) {
        available = sortMoves(state, available, player.color)
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
    Environment.debugPrint(`Rating: ${result.rating}`)
    Environment.debugPrint(`Selected move:`, result.value)

    if (result.success) {
        return result.value!
    } else {
        return fallback
    } 
}