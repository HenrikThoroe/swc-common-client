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
    .option("ai", {
        alias: "a",
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

process.on("exit", e => {
    console.log(`Process terminated with error code ${e}`)
})

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

    if (available.length === 0) {
        throw new Error(`No Moves Available`)
    }

    if (args.stupid) {
        console.log("stupid")
        return available[Math.floor(Math.random() * available.length)]
    }

    if (available.length < 900) {
        const moveMap = available
            .sort(() => Math.random() - 0.5) // shuffle array 
            .map(move => ({ move: move, rating: simulateMove(state, move, next => rate(next, player.color, move)) })) // sort array by estimated move order

        available = moveMap.sort((a, b) => b.rating - a.rating).map(a => a.move)
    }

    //console.log(simulateMove(state, available[0], state => rate(state, player.color)), available[0])

    const preRating = handleSpecialCase(state, player, available, undeployed)
    const logic = new AlphaBeta(state, available, player, 2, 1890 - timer.read())

    if (preRating.isSpecialCase && preRating.success) {
        return preRating.selectedMove!
    } else if (preRating.isSpecialCase) {
        throw new Error(`Failed to Generate Move`)
    }

    const result = logic.findBest()

    console.log(timer.read())
    console.log(result.value)

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
