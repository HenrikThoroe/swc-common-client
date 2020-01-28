#!/usr/bin/env node

import connect, { Move, Color, fetchMoves, State, Position, getNeighbours } from '@henrikthoroe/swc-client'
import nextState from './LookAhead/nextState'
import rate from './Rating/rate'
import conclude from './Rating/conclude'
import { foreach, filter } from '@henrikthoroe/swc-client/dist/utils'
import yargs from 'yargs'
import Piece, { Type } from '@henrikthoroe/swc-client/dist/client/Model/Piece'

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

process.on("exit", r => {
    console.log(r)
})

process.on("uncaughtException", e => {
    console.log("Uncaught", e)
})

connect({ host: args.host || "localhost", port: args.port || 13050, joinOptions: { rc: args.reservation } }, result => {
    console.log(result)
}, (state, undeployed, player, available) => {
    const time = () => Date.now()
    const start = time()
    const elapsed = () => time() - start
    const timeout = () => elapsed() > 1900

    const hasPiece = (type: Type, collection: Piece[]): boolean => {
        for (const piece of collection) {
            if (piece.type === type) {
                return true
            }
        }

        return false
    }


    console.log(player.color)
    if (available.length === 0) {
        console.log(fetchMoves(state).length)
        throw new Error("No available moves") // send missmove
    }

    available = available.sort((a, b) => {
        return rate(nextState(state, b), player.color) - rate(nextState(state, a), player.color)
    })

    console.log("available moves", available.length)

    // available.forEach(move => {
    //     if ((move.start as Position).x !== undefined) {
    //         console.log(move.start, move.end)
    //     } else {
    //         console.log("Set", move.end)
    //     }
    // })

    // First move. Lets start random #YAY
    if (available.length === 968) {
        const beeMoves = available.filter(m => (m.start as Piece).type === Type.BEE)
        // return beeMoves[Math.floor(Math.random() * beeMoves.length)]

        let min = Infinity
        let selected: Move | null = null

        for (const move of beeMoves) {
            const pos = Math.abs(move.end.x) + Math.abs(move.end.y) + Math.abs(move.end.z)
            const neighbourFields = getNeighbours(state.board, move.end)
            const count = filter(neighbourFields, neigh => neigh.pieces.length > 0 || neigh.isObstructed).length
            const border = 6 - neighbourFields.length
            const filled = count + border
            
            if (pos < min && filled === 0) {
                min = pos
                selected = move
            }
        }

        if (selected) {
            return selected
        }

        return beeMoves[Math.floor(Math.random() * beeMoves.length)]
    }

    if (undeployed.length === 11) {
        if ((player.color === Color.Red && !hasPiece(Type.BEE, state.undeployed.blue)) || (player.color === Color.Blue && !hasPiece(Type.BEE, state.undeployed.red))) {
            const beeMoves = available.filter(m => (m.start as Piece).type === Type.BEE)
            return beeMoves[0]
        }
    }

    // if (available.length === 11) {
    //     if (player.color === Color.Red && state.undeployed.blue.findIndex(p => p.type === Type.BEE) === -1) {
    //         const moves = available.filter(m => (m.start as Piece).type === Type.BEE)
    //         return moves[Math.floor(Math.random() * moves.length)]
    //     }

    //     if (player.color === Color.Blue && state.undeployed.red.findIndex(p => p.type === Type.BEE) === -1) {
    //         const moves = available.filter(m => (m.start as Piece).type === Type.BEE)
    //         return moves[Math.floor(Math.random() * moves.length)]
    //     }
    // }

    let selectedMove: Move | null = null
    const currentRating = rate(state, player.color)
    let horizon = 4

    console.log(available)

    const findMax = (state: State, moves: Move[], depth: number, alpha: number, beta: number): number => {
        if (depth === 0) {
            return rate(state, player.color)
        }

        let max = alpha

        for (const move of moves) {
            if (timeout()) {
                break
            }
 
            const next = nextState(state, move)
            const rating = depth === 0 ? rate(next, player.color) : findMin(next, fetchMoves(next), depth - 1, max, beta)
            
            if (rating > max) {
                max = rating
                // console.log("max", rating)
                
                if (depth === horizon) {
                    // console.log("take", rating)
                    selectedMove = move
                }
            }
    
            // Bring some random in to prevent opponent from finding some sort of schema
            if (rating === max && Math.random() > 0.5 && depth === horizon) {
                selectedMove = move
            }

            if (max >= beta) {
                break
            }
        }

        return max
    }

    const findMin = (state: State, moves: Move[], depth: number, alpha: number, beta: number): number => {
        if (depth === 0) {
            return rate(state, player.color)
        }

        let min = beta

        for (const move of moves) {
            if (timeout()) {
                break
            }

            const next = nextState(state, move)
            const rating = findMax(next, fetchMoves(next), depth - 1, alpha, min)
            
            if (rating < min) {
                min = rating
                // console.log("min", rating)
            }

            if (rating <= alpha) {
                break
            }
        }

        return min
    }

    console.time("Move Finding")
    let max = findMax(state, available, horizon, -Infinity, Infinity)//-Infinity

    // while (!timeout()) {
    //     console.log(elapsed(), horizon)
    //     const m = findMax(state, available, horizon, -Infinity, Infinity)

    //     if (m !== -Infinity && m !== Infinity) {
    //         max = m
    //     }

    //     horizon += 1
    // }

    console.log(max, `horizon: ${horizon}`, selectedMove)
    console.timeEnd("Move Finding")

    // if (currentRating > max) {
    //     throw new Error("It can only become worse...")
    // }

    // if (selectedMove) {
    //     console.log(selectedMove!, available)
    // }

    return selectedMove || available[Math.floor(Math.random() * available.length)]
})
.catch(error => {
    console.log("Caught Error")
    console.error(error)
})
.then(() => {

})
.finally(() => {
    console.log("Ending")
})
