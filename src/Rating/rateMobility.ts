import { State, Move, Position } from '@henrikthoroe/swc-client'
import { foreach, map } from '@henrikthoroe/swc-client/dist/utils'
import createSquareArray from '../utils/createSquareArray'
import sum from '../utils/sum'

export default function rateMobility(state: State, moves: Move[]): number {
    const points = {
        setMove: 1,
        dragMove: 1,
        multipleOptionsFactor: 0.8
    }

    const routes = createSquareArray(11, 0)

    foreach(moves, move => {
        const idx0 = move.end.x + 5
        const idx1 = move.end.y + 5
        const basePoints = ((move.start as Position).x !== undefined) ? points.dragMove : points.setMove
        
        if (routes[idx0][idx1] === 0) {
            routes[idx0][idx1] = basePoints
        } else {
            routes[idx0][idx1] += basePoints * points.multipleOptionsFactor
        }
    })

    return sum(map(routes, v => sum(v)))
}