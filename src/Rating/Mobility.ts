import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece"

export interface PieceCollection {
    ant: number
    bee: number
    beetle: number 
    grasshopper: number
    spider: number
}

export function emptyPieceCollection(): PieceCollection {
    return {
        ant: 0,
        bee: 0,
        beetle: 0, 
        grasshopper: 0,
        spider: 0
    }
}

export function readPieceCollection(collection: PieceCollection, type: Type) {
    switch (type) {
        case Type.BEE: return collection.bee
        case Type.BEETLE: return collection.beetle
        case Type.SPIDER: return collection.spider
        case Type.GRASSHOPPER: return collection.grasshopper
        case Type.ANT: return collection.ant
    }
}

export function sumPieceCollection(collection: PieceCollection): number {
    return collection.beetle + collection.bee + collection.ant + collection.grasshopper + collection.spider
}

export default interface Mobility {
    draggable: PieceCollection
    undeployed: PieceCollection
}