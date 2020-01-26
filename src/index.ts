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

    console.log(args)

connect({ host: args.host || "localhost", port: args.port || 13050, joinOptions: { rc: args.reservation } }, (state, undeployed, player, available) => {
    if (available.length === 0) {
        console.log(fetchMoves(state).length)
        throw new Error("No available moves") // send missmove
    }

    let selected: Move | null = null
    let max = -Infinity
    const currentRating = rate(state, player.color)

    for (const move of available) {
        const next = nextState(state, move)
        const rating = rate(next, player.color)

        if (rating > max) {
            max = rating
            selected = move
        }

        if (rating === max && Math.random() > 0.8) {
            selected = move
        }
    }

    if (currentRating >= max) {
        return available[Math.floor(Math.random() * available.length)]
    }

    return selected || available[Math.floor(Math.random() * available.length)]
})
.catch(error => {
    console.error(error)
})
