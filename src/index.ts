import connect, { Move, State, Result, Player, ConnectOptions } from '@henrikthoroe/swc-client'
import nextState from './LookAhead/nextState'
import rate from './Rating/rate'
import yargs from 'yargs'
import Piece from '@henrikthoroe/swc-client/dist/client/Model/Piece'
import handleSpecialCase from './Logic/handleSpecialCase'
import Algorithm from './Logic/Algorithm'

const args = yargs
    .option("host", {
        alias: "h",
        type: "string"
    })
    .option("port", {
        alias: "p",
        type: "number"
    })
    .option("reservation", {
        alias: "r",
        type: "string"
    })
    .parse()

const connectOpts: ConnectOptions = { 
    host: args.host || "localhost", 
    port: args.port || 13050, 
    joinOptions: { 
        rc: args.reservation 
    } 
}

function handleResult(result: Result) {
    console.log(result)
}

function handleMoveResuest(state: State, undeployed: Piece[], player: Player, available: Move[]) {
    if (available.length === 0) {
        throw new Error(`No Moves Available`)
    }

    available = available.sort((a, b) => {
        return rate(nextState(state, b), player.color) - rate(nextState(state, a), player.color)
    })

    const preRating = handleSpecialCase(state, player, available, undeployed)
    const logic = new Algorithm(state, available, player, 4, 1950)

    if (preRating.isSpecialCase && preRating.success) {
        return preRating.selectedMove!
    } else if (preRating.isSpecialCase) {
        throw new Error(`Failed to Generate Move`)
    }

    const result = logic.findBest()

    console.log(result)

    if (result.success) {
        return result.value!
    } else {
        return available[Math.floor(Math.random() * available.length)]
    } 
}

connect(connectOpts, handleResult, handleMoveResuest)
    .catch(error => {
        console.error("Failed to connect: ", error)
    })
