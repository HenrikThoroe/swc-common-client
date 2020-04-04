import connect, { Move, State, Result, Player, ConnectOptions } from '@henrikthoroe/swc-client'
import yargs from 'yargs'
import Piece from '@henrikthoroe/swc-client/dist/client/Model/Piece'
import handleSpecialCase from './Logic/handleSpecialCase'
import Timer from './utils/Timer'
import NegaScout from './Logic/NegaScout'
import sortMoves from './Logic/sortMoves'
import createStateMemoryTable from './Cache/createStateMemoryTable'
import evaluate from './Rating/evaluate'
import simulateMove from './LookAhead/simulateMove'
import MTDf from './Logic/MTDf'
import isBeePinned from './utils/isBeePinned'
import generateMoves from './LookAhead/generateMoves'

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

// const stateMemory = createStateMemoryTable()

process.on("exit", e => {
    console.log(`Process terminated with error code ${e}`)
})

function printMemoryUsage() {
    const usage = process.memoryUsage()
    const toMB = (mem: number) => (mem / 1024 / 1024).toFixed(2) + " Megabyte"

    console.log("---Memory Usage---")
    console.log(`RSS: ${toMB(usage.rss)}`)
    console.log(`Heap Total: ${toMB(usage.heapTotal)}`)
    console.log(`Heap Used: ${toMB(usage.heapUsed)}`)
    console.log(`External: ${toMB(usage.external)}`)
    console.log(`Array Buffers: ${toMB(usage.arrayBuffers)}`)
    console.log("------------------")
}

function handleResult(result: Result) {
    printMemoryUsage()
    console.log(result)
    process.exit()
}

// function memoryWrapper(state: State, undeployed: Piece[], player: Player, available: Move[]): Move {
//     const initialRating = evaluate(state, player.color).value
//     stateMemory.push(state.turn, initialRating)

//     try {
//         const move = handleMoveRequest(state, undeployed, player, available)
//         const rating = simulateMove(state, move, next => evaluate(next, player.color).value)
//         stateMemory.push(state.turn + 1, rating)
//         return move
//     } catch (e) {
//         stateMemory.push(state.turn + 1, initialRating)
//         throw e
//     }
    
// }

function handleMoveRequest(state: State, undeployed: Piece[], player: Player, elapsedTime: number) {
    const timer = new Timer(elapsedTime)
    let available = generateMoves(state)

    console.log(`Already elpased time: ${elapsedTime}`)

    if (available.length === 0) {
        throw new Error(`No Moves Available`)
    }

    if (args.stupid) {
        return available[Math.floor(Math.random() * available.length)]
    }

    if (available.length < 900) {
        available = sortMoves(state, available, player.color)
    }

    const preRating = handleSpecialCase(state, player, available, undeployed)
    const logic = new NegaScout(state, available, player, 3, 1890 - timer.read())

    if (preRating.isSpecialCase && preRating.success) {
        return preRating.selectedMove!
    } else if (preRating.isSpecialCase) {
        throw new Error(`Failed to Generate Move`)
    }

    const result = logic.find()

    console.log(`Finished search after ${timer.read()}ms`)
    console.log(`Rating: ${result.rating}`)
    console.log(`Selected move:`, result.value)

    if (result.success) {
        return result.value!
    } else {
        return available[Math.floor(Math.random() * available.length)]
    } 
}

connect(connectOpts, handleResult, handleMoveRequest)
    .catch(error => {
        console.error("Failed to connect: ", error)
    })
