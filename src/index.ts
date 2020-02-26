import connect, { Move, State, Result, Player, ConnectOptions } from '@henrikthoroe/swc-client'
import nextState from './LookAhead/nextState'
import rate from './Rating/rate'
import yargs from 'yargs'
import Piece from '@henrikthoroe/swc-client/dist/client/Model/Piece'
import handleSpecialCase from './Logic/handleSpecialCase'
import AlphaBeta from './Logic/Algorithm'
import Timer from './utils/Timer'
import simulateMove from './LookAhead/simulateMove'

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
    .option("stupid", {
        alias: "s",
        type: 'boolean'
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

function errorCatcher(state: State, undeployed: Piece[], player: Player, available: Move[]) {
    try {
        return handleMoveRequest(state, undeployed, player, available)
    } catch (error) {
        console.error(error)
        throw error
    }
}

function handleMoveRequest(state: State, undeployed: Piece[], player: Player, available: Move[]) {
    const timer = new Timer()

    console.log(`${available.length} moves are available`)
    if (available.length === 0) {
        throw new Error(`No Moves Available`)
    }

    if (args.stupid) {
        return available[Math.floor(Math.random() * available.length)]
    }

    if (available.length < 900) {
        available = available.sort((a, b) => {
            const bRating = simulateMove(state, b, next => rate(next, player.color))
            const aRating = simulateMove(state, a, next => rate(next, player.color))

            return bRating - aRating
        })
    }

    const preRating = handleSpecialCase(state, player, available, undeployed)
    const logic = new AlphaBeta(state, available, player, 3, 1900 - timer.read())

    if (preRating.isSpecialCase && preRating.success) {
        return preRating.selectedMove!
    } else if (preRating.isSpecialCase) {
        throw new Error(`Failed to Generate Move`)
    }

    const result = logic.findBest()

    if (result.success) {
        return result.value!
    } else {
        return available[Math.floor(Math.random() * available.length)]
    } 
}

connect(connectOpts, handleResult, errorCatcher)
    .catch(error => {
        console.error("Failed to connect: ", error)
    })
