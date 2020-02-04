import connect, { Move, State, Result, Player, ConnectOptions } from '@henrikthoroe/swc-client'
import nextState from './LookAhead/nextState'
import rate from './Rating/rate'
import yargs from 'yargs'
import Piece from '@henrikthoroe/swc-client/dist/client/Model/Piece'
import handleSpecialCase from './Logic/handleSpecialCase'
import Algorithm from './Logic/Algorithm'
import Timer from './utils/Timer'

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

function handleMoveResuest(state: State, undeployed: Piece[], player: Player, available: Move[]) {
    const timer = new Timer()
    console.log(timer.read())

    if (available.length === 0) {
        throw new Error(`No Moves Available`)
    }

    if (args.stupid) {
        return available[Math.floor(Math.random() * available.length)]
    }

    if (available.length < 900) {
        available = available.sort((a, b) => {
            return rate(nextState(state, b), player.color) - rate(nextState(state, a), player.color)
        })
    }

    console.log(timer.read(), 1900 - timer.read())
    const preRating = handleSpecialCase(state, player, available, undeployed)
    const logic = new Algorithm(state, available, player, 4, 1900 - timer.read())

    if (preRating.isSpecialCase && preRating.success) {
        return preRating.selectedMove!
    } else if (preRating.isSpecialCase) {
        throw new Error(`Failed to Generate Move`)
    }

    console.log(timer.read())
    const result = logic.findBest()
    console.log(result)
    console.log(timer.read(), available.length)

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
