import connect, { Move, Color, fetchMoves, State } from '@henrikthoroe/swc-client'
import nextState from './LookAhead/nextState'
import rate from './Rating/rate'
import conclude from './Rating/conclude'
import { foreach } from '@henrikthoroe/swc-client/dist/utils'
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

connect({ host: args.host || "localhost", port: args.port || 13050, joinOptions: { rc: args.reservation } }, (state, undeployed, player, available) => {
    if (available.length === 0) {
        console.log(fetchMoves(state).length)
        throw new Error("No available moves") // send missmove
    }

    console.log("available moves", available.length)

    // First move. Lets start random #YAY
    if (available.length === 968) {
        return available[Math.floor(Math.random() * available.length)]
    }

    let selectedMove: Move | null = null
    const currentRating = rate(state, player.color)

    const findMax = (state: State, moves: Move[]): number => {
        let max = -Infinity

        for (const move of moves) {
            const next = nextState(state, move)
            const rating = rate(next, player.color)

            const value = findMin(next, fetchMoves(next))
            
            if (value > max) {
                max = value
                selectedMove = move
            }
    
            // Bring some random in to prevent opponent from finding some sort of schema
            if (value === max && Math.random() > 0.8) {
                selectedMove = move
            }
        }

        return max
    }

    const findMin = (state: State, moves: Move[]): number => {
        let min = Infinity

        for (const move of moves) {
            const next = nextState(state, move)
            const rating = rate(next, player.color)
            
            if (rating < min) {
                min = rating
                // minMove = move
            }
    
            // Bring some random in to prevent opponent from finding some sort of schema
            if (rating === min && Math.random() > 0.8) {
                // minMove = move
            }
        }

        return min
    }

    console.log(
        findMax(state, available)
    )

    // if (currentRating > max) {
    //     return available[Math.floor(Math.random() * available.length)]
    // }

    

    return selectedMove || available[Math.floor(Math.random() * available.length)]
})
.catch(error => {
    console.error(error)
})
