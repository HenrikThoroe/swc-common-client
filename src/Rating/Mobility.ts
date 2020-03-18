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

export function sumPieceCollection(collection: PieceCollection): number {
    return collection.beetle + collection.bee + collection.ant + collection.grasshopper + collection.spider
}

export default interface Mobility {
    draggable: PieceCollection
    undeployed: PieceCollection
}