import { State } from '@henrikthoroe/swc-client'
import { ConcreteAspect } from '.'
import Mobility, { PieceCollection } from './Mobility'
import GamePhase from './GamePhase'
import { Type } from '@henrikthoroe/swc-client/dist/client/Model/Piece'

const pieceTable = {
    ant:            [0.9,     1,      1],
    beetle:         [0.9,     0.7,    0.6],
    bee:            [1,     1,      1],
    spider:         [0.7,   0.9,    0.6],
    grasshopper:    [0.4,   0.9,    1]
}

function pieceValue(phase: GamePhase, type: Type) {
    const index = phase === "early" ? 0 : phase === "mid" ? 1 : 2

    switch (type) {
        case Type.BEETLE:       return pieceTable.beetle[index]
        case Type.ANT:          return pieceTable.ant[index]
        case Type.BEE:          return pieceTable.bee[index]
        case Type.SPIDER:       return pieceTable.spider[index]
        case Type.GRASSHOPPER:  return pieceTable.grasshopper[index]
    }
}

function queenFactor(phase: GamePhase, isOwnQueen: boolean): number {
    switch (phase) {
        case "early": return isOwnQueen ? 10 : 10
        case "mid": return 10
        case "late": return 10
    }
}

export default function rateMobility(state: State, phase: GamePhase, mobility: ConcreteAspect<Mobility>): ConcreteAspect<number> {
    const rateDraggable = (pieces: PieceCollection, queenFactor: number) => {
        if (pieces.bee === 0) {
            return 0
        }

        const summedDraggable = 
            1 * pieces.ant + 
            queenFactor * pieces.bee +
            1 * pieces.beetle +
            1 * pieces.spider +
            1 * pieces.grasshopper

        const value = summedDraggable / (10 + queenFactor)

        switch (phase) {
            case "early": return value * 2.5
            case "mid": return value * 6
            case "late": return value * 5
        }
    }

    const rateUndeployed = (pieces: PieceCollection) => {
        // The lower the better
        const summedUndeployed = 
            pieceValue(phase, Type.ANT) * pieces.ant + 
            pieceValue(phase, Type.BEE) * pieces.bee +
            pieceValue(phase, Type.BEETLE) * pieces.beetle +
            pieceValue(phase, Type.SPIDER) * pieces.spider +
            pieceValue(phase, Type.GRASSHOPPER) * pieces.grasshopper

        // Normalized undeployed rating
        const value =  1 - summedUndeployed / 11

        switch (phase) {
            case "early": return value * 7.5
            case "mid": return value * 4
            case "late": return value * 5
        }
    }

    return {
        own: (rateUndeployed(mobility.own.undeployed) + rateDraggable(mobility.own.draggable, queenFactor(phase, true))) / 10,
        opponent: (rateUndeployed(mobility.opponent.undeployed) + rateDraggable(mobility.opponent.draggable, queenFactor(phase, false))) / 10
    }
}