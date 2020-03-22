import connect, { Move, State, Result, Player, ConnectOptions } from '@henrikthoroe/swc-client'
import rate from './Rating/rate'
import yargs from 'yargs'
import Piece from '@henrikthoroe/swc-client/dist/client/Model/Piece'
import handleSpecialCase from './Logic/handleSpecialCase'
import Timer from './utils/Timer'
import simulateMove from './LookAhead/simulateMove'
import NegaScout from './Logic/NagaScout'
import sortMoves from './Logic/sortMoves'

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
    process.kill(process.pid, 0)
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

    // const hasher = (state: State) => {
    //     let key = ""

    //     enumerateBoard(state.board, field => {
    //         for (let i = 0; i < field.pieces.length; ++i) {
    //             const id = (field.position.x << 12) ^ (field.position.y << 8) ^ (field.position.z << 4) ^ (field.pieces[i].type << 3) ^ field.pieces[i].owner
    //             key += encodeBase64(id)
    //         }
    //     })

    //     return key
    // }

    // console.log(hasher(state), hasher(state))

    if (available.length === 0) {
        throw new Error(`No Moves Available`)
    }

    if (args.stupid) {
        console.log("stupid")
        return available[Math.floor(Math.random() * available.length)]
    }

    if (available.length < 900) {
        // const moveMap = available
        //     .sort(() => Math.random() - 0.5) // shuffle array 
        //     .map(move => ({ move: move, rating: simulateMove(state, move, next => rate(next, player.color).value) })) // sort array by estimated move order

        // available = moveMap.sort((a, b) => b.rating - a.rating).map(a => a.move)

        available = sortMoves(state, available, player.color)
    }

    // enumerateBoard(state.board, field => {
    //     if (field.pieces.length > 0) {
    //         console.log(field.position, isDraggable(state, field.position))
    //     }
    // })

    //console.log(simulateMove(state, available[0], state => rate(state, player.color)), available[0])

    const preRating = handleSpecialCase(state, player, available, undeployed)
    const logic = new NegaScout(state, available, player, 3, 1890 - timer.read())

    if (preRating.isSpecialCase && preRating.success) {
        return preRating.selectedMove!
    } else if (preRating.isSpecialCase) {
        throw new Error(`Failed to Generate Move`)
    }

    const result = logic.find()

    console.log(timer.read())
    console.log(result.rating, result.value)

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
